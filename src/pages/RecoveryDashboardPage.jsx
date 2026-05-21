import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';
import { paymentService } from '../services/payment.service';

const getSessionId = (session) => session._id || session.id || session.orderId;

const getUserLabel = (user) => {
  if (!user) return 'Unknown user';
  if (typeof user === 'string') return user;
  return user.email || user.userName || user._id || 'Unknown user';
};

const formatAge = (createdAt) => {
  if (!createdAt) return 'Unknown';
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
};

const RecoveryDashboardPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resolvingOrderId, setResolvingOrderId] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await paymentService.getPendingSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load pending payment sessions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleResolve = async (orderId, action) => {
    const label = action === 'settle' ? 'paid' : 'failed';
    if (!window.confirm(`Mark order ${orderId} as ${label}?`)) return;

    try {
      setResolvingOrderId(orderId);
      await paymentService.resolvePendingSession(orderId, action);
      setSessions(prev => prev.filter(session => session.orderId !== orderId));
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || `Failed to mark payment as ${label}.`);
    } finally {
      setResolvingOrderId(null);
    }
  };

  return (
    <div className="dashboard-page fade-in">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Payment Recovery</h1>
          <p className="page-subtitle">Manually resolve stuck PayHere payment sessions.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Pending Manual Reviews</h2>
          <button className="btn btn-secondary" onClick={fetchSessions} disabled={loading}>
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
        <div className="card-body">
          {error && (
            <div className="form-alert" style={{ marginBottom: '1rem' }}>
              <AlertCircle size={20} /> {error}
            </div>
          )}

          {loading ? (
            <div className="page-loader" style={{ minHeight: '200px' }}><div className="loader-ring" /></div>
          ) : sessions.length === 0 ? (
            <div className="form-alert" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
              <CheckCircle size={20} /> All payments reconciled.
            </div>
          ) : (
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <th style={{ padding: '1rem' }}>Order ID</th>
                  <th style={{ padding: '1rem' }}>User</th>
                  <th style={{ padding: '1rem' }}>Amount</th>
                  <th style={{ padding: '1rem' }}>State</th>
                  <th style={{ padding: '1rem' }}>Age</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => {
                  const payment = session.payment || {};
                  const isResolving = resolvingOrderId === session.orderId;
                  return (
                    <tr key={getSessionId(session)} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{session.orderId}</td>
                      <td style={{ padding: '1rem' }}>{getUserLabel(session.userId)}</td>
                      <td style={{ padding: '1rem' }}>
                        {payment.amount != null ? `${payment.amount} ${payment.currency || 'LKR'}` : 'Unknown'}
                      </td>
                      <td style={{ padding: '1rem' }}>{session.reconciliationState}</td>
                      <td style={{ padding: '1rem', color: 'var(--error)' }}>
                        <AlertCircle size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }} />
                        {formatAge(session.createdAt)}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-primary" disabled={isResolving} onClick={() => handleResolve(session.orderId, 'settle')}>
                            Mark Paid
                          </button>
                          <button className="btn btn-danger" disabled={isResolving} onClick={() => handleResolve(session.orderId, 'fail')}>
                            Mark Failed
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoveryDashboardPage;
