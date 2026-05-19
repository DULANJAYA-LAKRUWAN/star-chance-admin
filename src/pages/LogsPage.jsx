import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics.service';
import { ShieldAlert, Loader, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';
import { Card } from '../components/ui/Card';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedLogId, setExpandedLogId] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getSecurityLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const toggleExpand = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const filteredLogs = logs.filter(log => {
    const term = search.toLowerCase();
    return (
      log.adminEmail?.toLowerCase().includes(term) ||
      log.action?.toLowerCase().includes(term) ||
      JSON.stringify(log.details)?.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>System Logs</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Comprehensive security & administrative audit trails</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <Search color="var(--text-muted)" size={18} />
          <input
            type="text"
            placeholder="Search logs by action or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '250px', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader className="animate-spin" size={48} color="var(--accent)" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <ShieldAlert size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No audit logs found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredLogs.map((log) => (
              <div
                key={log._id}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  padding: '1.25rem 1.5rem',
                  background: expandedLogId === log._id ? 'var(--bg-surface-hover)' : 'transparent',
                  transition: 'background var(--transition-fast)',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => toggleExpand(log._id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-md)',
                      background: log.severity === 'ERROR' ? 'var(--error-bg)' : 'var(--success-bg)',
                      color: log.severity === 'ERROR' ? 'var(--error)' : 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {log.action?.slice(0, 2)}
                    </div>

                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        {log.action}
                      </h4>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Triggered by: <strong>{log.adminEmail}</strong>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={14} />
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    {expandedLogId === log._id ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                </div>

                {expandedLogId === log._id && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: '#09090b', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', overflowX: 'auto' }}>
                    <pre style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#38bdf8', lineHeight: 1.5 }}>
                      {JSON.stringify(log.details || {}, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default LogsPage;
