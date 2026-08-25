import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, ChevronDown, ChevronRight, Activity, Sparkles } from 'lucide-react';

export default function GaugeCard({ result, requestData }) {
  const [showJson, setShowJson] = useState(false);

  if (!result) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Activity className="card-icon" size={20} />
            <span>Prediction Analysis</span>
          </div>
        </div>
        <div className="results-empty">
          <Sparkles className="empty-icon" />
          <p style={{ fontWeight: 600, color: '#94a3b8' }}>Awaiting Prediction Query</p>
          <p style={{ fontSize: '0.85rem' }}>
            Select source and destination disaster nodes, choose a cascade relation type, and click <strong>Predict Cascade</strong> to analyze the probability.
          </p>
        </div>
      </div>
    );
  }

  const { probability, verdict } = result;
  const percentage = (probability * 100).toFixed(2);
  const isPositive = verdict === true;

  // SVG Gauge calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probability * circumference);

  return (
    <div className="card" style={{ borderColor: isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)' }}>
      <div className="card-header">
        <div className="card-title">
          <Activity className="card-icon" size={20} style={{ color: isPositive ? '#10b981' : '#ef4444' }} />
          <span>Inference Results</span>
        </div>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
          TemporalGNN v1.0
        </span>
      </div>

      <div className="results-content">
        {/* Verdict Banner */}
        <div className={`verdict-banner ${isPositive ? 'positive' : 'negative'}`}>
          <div>
            <div className="verdict-label">Cascade Verdict</div>
            <div className="verdict-value">
              {isPositive ? (
                <>
                  <CheckCircle2 size={24} />
                  <span>CASCADE PREDICTED</span>
                </>
              ) : (
                <>
                  <XCircle size={24} />
                  <span>NO CASCADE</span>
                </>
              )}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="verdict-label">Decision</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.4rem' }}>
              {isPositive ? 'TRUE' : 'FALSE'}
            </div>
          </div>
        </div>

        {/* Circular Probability Gauge */}
        <div className="gauge-section">
          <div className="gauge-circle-container">
            <svg className="gauge-svg" viewBox="0 0 160 160">
              <circle
                className="gauge-bg"
                cx="80"
                cy="80"
                r={radius}
              />
              <circle
                className={`gauge-fill ${isPositive ? 'positive' : 'negative'}`}
                cx="80"
                cy="80"
                r={radius}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            <div className="gauge-text-overlay">
              <span className="gauge-pct">{percentage}%</span>
              <span className="gauge-subtext">Link Probability</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
            <div>
              <span style={{ color: '#64748b' }}>Raw Logit Sigmoid: </span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>{probability.toFixed(6)}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Threshold: </span>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#f8fafc' }}>&ge; 0.5000</strong>
            </div>
          </div>
        </div>

        {/* Flow Visualization */}
        {requestData && (
          <div className="link-flow-box">
            <div className="flow-node">
              <span className="flow-node-title">Source Event</span>
              <span className="flow-node-id">{requestData.src_id}</span>
            </div>

            <div className="flow-arrow">
              <span className="flow-rel-badge">{requestData.relation}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: isPositive ? '#34d399' : '#f87171' }}>
                  {percentage}%
                </span>
                <ArrowRight size={16} />
              </div>
            </div>

            <div className="flow-node">
              <span className="flow-node-title">Target Event</span>
              <span className="flow-node-id">{requestData.dst_id}</span>
            </div>
          </div>
        )}

        {/* Collapsible JSON Output */}
        <div>
          <div className="details-toggle" onClick={() => setShowJson(!showJson)}>
            {showJson ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            <span>View Raw API Response Payload</span>
          </div>

          {showJson && (
            <div className="raw-json-box" style={{ marginTop: '0.5rem' }}>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
