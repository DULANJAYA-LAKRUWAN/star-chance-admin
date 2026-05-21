import React, { useCallback, useEffect, useState } from 'react';
import { AlertOctagon, CheckCircle, RefreshCcw, RotateCw } from 'lucide-react';
import { drawService } from '../services/draw.service';

const getFailureId = (failure) => failure._id || failure.id;

const DLQViewerPage = () => {
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryingId, setRetryingId] = useState(null);

  const fetchFailures = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await drawService.getDrawFailures();
      setFailures(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load failed draw settlements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFailures();
  }, [fetchFailures]);

  const handleRetry = async (failure) => {
    const failureId = getFailureId(failure);
    if (!window.confirm(`Retry settlement for draw ${failure.drawId}?`)) return;

    try {
      setRetryingId(failureId);
      await drawService.retryDrawFailure(failureId);
      setFailures(prev => prev.map(item => (
        getFailureId(item) === failureId ? { ...item, resolved: true } : item
      )));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to retry draw settlement.');
    } finally {
      setRetryingId(null);
    }
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
          <button className="btn btn-secondary" onClick={fetchFailures} disabled={loading}>
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
        <div className="card-body">
          {error && (
            <div className="form-alert" style={{ marginBottom: '1rem' }}>
              <AlertOctagon size={20} /> {error}
            </div>
          )}

          {loading ? (
            <div className="page-loader" style={{ minHeight: '200px' }}><div className="loader-ring" /></div>
          ) : failures.length === 0 ? (
            <div className="form-alert" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle size={20} /> No failed draws detected.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {failures.map(failure => {
                const failureId = getFailureId(failure);
                const isRetrying = retryingId === failureId;
                return (
                  <div key={failureId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem', gap: '1rem', opacity: failure.resolved ? 0.7 : 1 }}>
                    <div>
                      <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertOctagon size={18} color={failure.resolved ? 'var(--success)' : 'var(--error)'} /> Draw {failure.drawId}
                      </h3>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Error: <strong>{failure.reason}</strong>
                      </p>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {failure.createdAt ? new Date(failure.createdAt).toLocaleString() : 'No timestamp'}
                        {failure.resolved ? ' · Resolved' : ''}
                      </small>
                    </div>
                    <button className="btn btn-secondary" onClick={() => handleRetry(failure)} disabled={failure.resolved || isRetrying}>
                      <RotateCw size={16} /> {isRetrying ? 'Retrying...' : 'Retry Settlement'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DLQViewerPage;
