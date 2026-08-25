import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers,
  Zap,
  Activity,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Server,
  ExternalLink,
  Info
} from 'lucide-react';
import SearchableSelect from './components/SearchableSelect';
import GaugeCard from './components/GaugeCard';

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'https://tgnn-inference.onrender.com';

const DEMO_PRESETS = [
  {
    name: 'Sample Cascade (Causal)',
    src_id: '1960-0040',
    dst_id: '1961-0030',
    relation: 'CausalRelation',
    desc: 'Known benchmark pair'
  },
  {
    name: 'Sample Spatial Adjacent',
    src_id: '1960-0040',
    dst_id: '1961-0030',
    relation: 'Spatial_Adjacent',
    desc: 'Spatial cascade relation'
  },
  {
    name: 'Sample Negative Control',
    src_id: '1960-0040',
    dst_id: '1961-0030',
    relation: 'no_cascade',
    desc: 'Non-cascading control'
  }
];

export default function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [nodes, setNodes] = useState([]);
  const [relations, setRelations] = useState([]);
  const [healthStatus, setHealthStatus] = useState('checking'); // 'online' | 'offline' | 'checking'

  const [srcId, setSrcId] = useState('1960-0040');
  const [dstId, setDstId] = useState('1961-0030');
  const [relation, setRelation] = useState('CausalRelation');

  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);

  // Health check query
  const checkHealth = useCallback(async (base) => {
    try {
      const hRes = await fetch(`${base}/health`);
      if (hRes.ok) {
        const hData = await hRes.json();
        if (hData && hData.status === 'healthy') {
          setHealthStatus('online');
          return true;
        }
      }
      setHealthStatus('offline');
      return false;
    } catch {
      setHealthStatus('offline');
      return false;
    }
  }, []);

  // Fetch /health, /nodes, and /relations on mount or when API URL changes
  useEffect(() => {
    async function loadMetadata() {
      setLoadingMeta(true);
      setError(null);
      setHealthStatus('checking');

      const base = apiUrl.replace(/\/+$/, '');

      // Execute health check
      const isHealthy = await checkHealth(base);

      // Fetch Nodes & Relations
      try {
        const [nodesRes, relsRes] = await Promise.all([
          fetch(`${base}/nodes`),
          fetch(`${base}/relations`)
        ]);

        if (!nodesRes.ok) throw new Error(`Failed to load nodes: ${nodesRes.statusText}`);
        if (!relsRes.ok) throw new Error(`Failed to load relations: ${relsRes.statusText}`);

        const nodesData = await nodesRes.json();
        const relsData = await relsRes.json();

        setNodes(nodesData.nodes || []);
        setRelations(relsData.relations || []);

        // If nodes & relations loaded, backend is online
        setHealthStatus('online');

        // Set default relation if available
        if (relsData.relations && relsData.relations.length > 0 && !relsData.relations.includes(relation)) {
          setRelation(relsData.relations[0]);
        }
      } catch (err) {
        console.error('Failed to load API metadata:', err);
        setError(`Unable to connect to backend API at ${apiUrl}. Please check if the server is awake.`);
        if (!isHealthy) {
          setHealthStatus('offline');
        }
      } finally {
        setLoadingMeta(false);
      }
    }

    loadMetadata();
  }, [apiUrl, checkHealth]);

  const handlePredict = async (e) => {
    e?.preventDefault();
    if (!srcId.trim() || !dstId.trim() || !relation.trim()) {
      setError('Please select a Source Node, Destination Node, and Relation Type.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      src_id: srcId.trim(),
      dst_id: dstId.trim(),
      relation: relation.trim()
    };

    try {
      const base = apiUrl.replace(/\/+$/, '');
      const response = await fetch(`${base}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Prediction failed with status: ${response.status}`);
      }

      setPredictionResult(data);
      setLastRequest(payload);
      setHealthStatus('online');
    } catch (err) {
      console.error('Prediction request error:', err);
      setError(err.message || 'An unexpected error occurred during link prediction.');
      setPredictionResult(null);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset) => {
    setSrcId(preset.src_id);
    setDstId(preset.dst_id);
    setRelation(preset.relation);
    setError(null);
  };

  const handleReset = () => {
    setSrcId('');
    setDstId('');
    setRelation(relations[0] || 'CausalRelation');
    setPredictionResult(null);
    setLastRequest(null);
    setError(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="badge-header">
          <span
            className="badge-dot"
            style={{
              backgroundColor:
                healthStatus === 'online'
                  ? '#34d399'
                  : healthStatus === 'offline'
                  ? '#f87171'
                  : '#fbbf24',
              boxShadow:
                healthStatus === 'online'
                  ? '0 0 8px #34d399'
                  : healthStatus === 'offline'
                  ? '0 0 8px #f87171'
                  : '0 0 8px #fbbf24'
            }}
          />
          <span>
            {healthStatus === 'online'
              ? 'API ONLINE'
              : healthStatus === 'offline'
              ? 'API OFFLINE'
              : 'API COLD / CHECKING'}
          </span>
        </div>

        <h1 className="title">TemporalGNN Disaster Cascade Prediction</h1>
        <p className="subtitle">
          Predicting whether a cascading disaster link exists between spatial-temporal disaster events using a trained Temporal Graph Neural Network.
        </p>

        <div className="api-status-bar">
          <Server size={14} />
          <span>Backend Target:</span>
          <code>{apiUrl}</code>
          <a
            href={`${apiUrl.replace(/\/+$/, '')}/docs`}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', marginLeft: '0.25rem' }}
            title="Open Swagger API Docs"
          >
            <span>Docs</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Left Column: Input Query Card */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Layers className="card-icon" size={20} />
              <span>Link Prediction Query</span>
            </div>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontSize: '0.8rem'
              }}
              title="Reset inputs"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="presets-container">
            <div className="presets-label">Quick Demo Presets</div>
            <div className="preset-chips">
              {DEMO_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="preset-chip"
                  onClick={() => applyPreset(p)}
                  title={p.desc}
                >
                  ⚡ {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Query Form */}
          <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Source Node Selector */}
            <SearchableSelect
              label="Source Disaster Node (src_id)"
              value={srcId}
              onChange={setSrcId}
              options={nodes}
              placeholder={loadingMeta ? 'Loading disaster nodes...' : 'Select source disaster event...'}
              disabled={loadingMeta}
              badgeText={`${nodes.length.toLocaleString()} Nodes`}
            />

            {/* Destination Node Selector */}
            <SearchableSelect
              label="Destination Disaster Node (dst_id)"
              value={dstId}
              onChange={setDstId}
              options={nodes}
              placeholder={loadingMeta ? 'Loading disaster nodes...' : 'Select target disaster event...'}
              disabled={loadingMeta}
              badgeText={`${nodes.length.toLocaleString()} Nodes`}
            />

            {/* Relation Type Dropdown */}
            <div className="form-group">
              <div className="form-label">
                <span>Cascade Relation Type</span>
                <span className="form-label-meta">{relations.length} Relations</span>
              </div>
              <select
                className="select-input"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                disabled={loadingMeta || relations.length === 0}
              >
                {relations.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert-error">
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Prediction Error:</strong>
                  <div style={{ marginTop: '0.2rem', fontSize: '0.85rem' }}>{error}</div>
                </div>
              </div>
            )}

            {/* Predict Button */}
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || loadingMeta || !srcId || !dstId}
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  <span>Computing Temporal Link Embeddings...</span>
                </>
              ) : (
                <>
                  <Zap size={18} />
                  <span>Predict Cascade Link</span>
                </>
              )}
            </button>
          </form>

          {/* Model Constraints Notice */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
            <Info size={15} style={{ flexShrink: 0, marginTop: '1px', color: '#818cf8' }} />
            <span>
              This model performs temporal inductive link prediction exclusively between 1,970 historical disaster cascade events seen during training.
            </span>
          </div>
        </div>

        {/* Right Column: Prediction Results Card */}
        <GaugeCard
          result={predictionResult}
          requestData={lastRequest}
        />
      </div>

      {/* Footer */}
      <footer className="footer">
        TemporalGNN Disaster Cascade Prediction API &bull; Built with PyTorch & FastAPI &bull; Deployed on Render
      </footer>
    </div>
  );
}
