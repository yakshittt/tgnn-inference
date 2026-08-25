import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';

export default function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Search or select node...",
  disabled = false,
  badgeText = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query (limit to 50 for max performance)
  const filteredOptions = options
    .filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 50);

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="form-group" ref={wrapperRef}>
      <div className="form-label">
        <span>{label}</span>
        {badgeText && <span className="form-label-meta">{badgeText}</span>}
      </div>

      <div className="combobox-wrapper">
        <div
          className="select-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            userSelect: 'none'
          }}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span style={{ color: value ? '#f8fafc' : '#64748b', fontFamily: value ? 'var(--font-mono)' : 'inherit', fontWeight: value ? 600 : 400 }}>
            {value || placeholder}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex' }}
                title="Clear selection"
              >
                <X size={16} />
              </button>
            )}
            <ChevronDown size={16} style={{ color: '#94a3b8', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </div>
        </div>

        {isOpen && (
          <div className="combobox-dropdown">
            <div style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Search size={14} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                autoFocus
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type to filter..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ maxHeight: '170px', overflowY: 'auto' }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => {
                  const isSelected = opt === value;
                  return (
                    <div
                      key={opt}
                      className={`combobox-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect(opt)}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check size={14} style={{ color: '#818cf8' }} />}
                    </div>
                  );
                })
              ) : (
                <div className="combobox-empty">No matching nodes found</div>
              )}
            </div>
            {options.length > 50 && (
              <div style={{ padding: '0.35rem 0.6rem', fontSize: '0.7rem', color: '#64748b', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                Showing top {filteredOptions.length} of {options.length} nodes
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
