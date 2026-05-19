import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics.service';
import { Bell, Ticket, Loader, ShieldAlert } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, LOG, TICKET
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const feed = await analyticsService.getActivityFeed();
        
        const recentLogs = feed.logs.map(log => ({
          id: log._id,
          type: 'LOG',
          msg: `Admin Action: ${log.action}`,
          time: new Date(log.createdAt).toLocaleTimeString(),
          date: new Date(log.createdAt).toLocaleDateString(),
          details: log.details
        }));
        
        const recentTickets = feed.tickets.map(t => ({
          id: t._id,
          type: 'TICKET',
          msg: `New ticket purchase: ${t.userId?.userName || 'Unknown User'}`,
          time: new Date(t.createdAt).toLocaleTimeString(),
          date: new Date(t.createdAt).toLocaleDateString(),
          details: { draw: t.drawId }
        }));
        
        const combined = [...recentLogs, ...recentTickets].sort((a,b) => new Date(b.time) - new Date(a.time));
        setActivities(combined);
      } catch (err) {
        setError(err.message || 'Failed to load activity feed');
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();

    const sse = analyticsService.subscribeToEvents((event) => {
      if (event.type === 'NEW_AUDIT_LOG') {
        setActivities(prev => [{
          id: event.data._id,
          type: 'LOG',
          msg: `Live: ${event.data.action}`,
          time: new Date(event.data.createdAt).toLocaleTimeString(),
          date: new Date(event.data.createdAt).toLocaleDateString(),
          details: event.data.details
        }, ...prev]);
      }
      
      if (event.type === 'TICKET_PURCHASED') {
        setActivities(prev => [{
          id: event.data._id,
          type: 'TICKET',
          msg: `Live Ticket Sale: ${event.data.ticketId}`,
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
          details: { draw: event.data.drawId }
        }, ...prev]);
      }
    });

    return () => sse.close();
  }, []);

  const filteredActivities = activities.filter(act => {
    if (filter === 'ALL') return true;
    return act.type === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>System Activity</h1>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Real-time audit log stream and platform activities</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '0.25rem', borderRadius: 'var(--radius-lg)' }}>
          {['ALL', 'LOG', 'TICKET'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                border: 'none',
                background: filter === type ? 'var(--bg-surface-active)' : 'transparent',
                color: filter === type ? 'var(--text-main)' : 'var(--text-secondary)',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {type === 'ALL' ? 'All Activities' : type === 'LOG' ? 'Admin Logs' : 'Tickets'}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardBody style={{ padding: '2rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Loader className="animate-spin" size={48} color="var(--accent)" />
            </div>
          ) : error ? (
            <div style={{ color: 'var(--error)', textAlign: 'center', padding: '2rem' }}>{error}</div>
          ) : filteredActivities.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <Bell size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>No activity records match the filter.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '20px', top: '10px', bottom: '10px', width: '2px', background: 'var(--border-subtle)' }} />

              {filteredActivities.map((act, i) => (
                <div key={act.id} style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', position: 'relative' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '12px',
                    background: act.type === 'LOG' ? 'var(--info-bg)' : 'var(--success-bg)',
                    color: act.type === 'LOG' ? 'var(--info)' : 'var(--success)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2,
                    border: '4px solid var(--bg-surface)'
                  }}>
                    {act.type === 'LOG' ? <ShieldAlert size={18} /> : <Ticket size={18} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>{act.msg}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{act.date} {act.time}</span>
                    </div>
                    {act.details && (
                      <pre style={{
                        margin: '0.5rem 0 0',
                        padding: '0.75rem',
                        background: 'var(--bg-surface-hover)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        overflowX: 'auto'
                      }}>
                        {JSON.stringify(act.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ActivitiesPage;
