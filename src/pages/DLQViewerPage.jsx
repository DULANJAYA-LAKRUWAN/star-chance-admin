import React, { useState, useEffect } from 'react';
import { AlertOctagon, RotateCw } from 'lucide-react';

const DLQViewerPage = () => {
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setFailures([
        { id: '1', drawId: 'DRW-2026-05-20', reason: 'Redis Lock Timeout', timestamp: new Date(Date.now() - 86400000).toLocaleString() }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleRetry = (id) => {
    setFailures(prev => prev.filter(f => f.id !== id));
    alert(`Retrying draw settlement for failure ${id}...`);
  };

  return (
    <div className="dashboard-page fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Draw Settlement DLQ</h1>
          <p className="page-subtitle">View and retry failed lottery draw settlements.</p>
        </div>
      </div>
      
      <div className="card" style={{ borderColor: 'var(--error)' }}>
        <div className="card-header" style={{ background: 'var(--error-bg)' }}>
          <h2 className="card-title" style={{ color: 'var(--error)' }}>Dead Letter Queue</h2>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="page-loader" style={{ minHeight: '200px' }}><div className="loader-ring" /></div>
          ) : failures.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No failed draws detected.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {failures.map(f => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: '1rem', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                  <div>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertOctagon size={18} color="var(--error)" /> Draw {f.drawId}
                    </h3>
                    <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Error: <strong>{f.reason}</strong></p>
                    <small style={{ color: 'var(--text-muted)' }}>{f.timestamp}</small>
                  </div>
                  <button className="btn btn-secondary" onClick={() => handleRetry(f.id)}>
                    <RotateCw size={16} /> Retry Settlement
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DLQViewerPage;
