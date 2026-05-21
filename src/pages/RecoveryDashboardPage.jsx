import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';

const RecoveryDashboardPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock initial data fetch
  useEffect(() => {
    setTimeout(() => {
      setSessions([
        { id: '1', orderId: 'SC-12345-001', userId: 'usr_8a92b', amount: 1500, state: 'MANUAL_REVIEW', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: '2', orderId: 'SC-12345-002', userId: 'usr_2b92a', amount: 500, state: 'MANUAL_REVIEW', createdAt: new Date(Date.now() - 4000000).toISOString() }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleResolve = (id, resolution) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    alert(`Session ${id} resolved as ${resolution}`);
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
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>
        <div className="card-body">
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
                  <th style={{ padding: '1rem' }}>Amount</th>
                  <th style={{ padding: '1rem' }}>Time Stuck</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{s.orderId}</td>
                    <td style={{ padding: '1rem' }}>{s.amount} LKR</td>
                    <td style={{ padding: '1rem', color: 'var(--error)' }}>
                      <AlertCircle size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: 'text-bottom' }}/> 
                      &gt; 1 hour
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" onClick={() => handleResolve(s.id, 'PAID')}>Mark Paid</button>
                      <button className="btn btn-danger" onClick={() => handleResolve(s.id, 'FAILED')}>Mark Failed</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecoveryDashboardPage;
