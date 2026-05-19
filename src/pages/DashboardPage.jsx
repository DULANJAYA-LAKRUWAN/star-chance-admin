import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics.service';
import { Activity, DollarSign, Users, Ticket, Bell, Loader } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Badge } from '../components/ui/Badge';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sseConnected, setSseConnected] = useState(false);

  useEffect(() => {
    let sse;
    const fetchInitialData = async () => {
      try {
        const data = await analyticsService.getStats();
        setStats(data);
        
        const feed = await analyticsService.getActivityFeed();
        const recentLogs = feed.logs.map(log => ({
          id: log._id,
          type: 'LOG',
          msg: `Admin Action: ${log.action}`,
          time: new Date(log.createdAt).toLocaleTimeString(),
        }));
        
        const recentTickets = feed.tickets.map(t => ({
          id: t._id,
          type: 'TICKET',
          msg: `New ticket purchase: ${t.userId?.userName || 'Unknown'}`,
          time: new Date(t.createdAt).toLocaleTimeString(),
        }));
        
        const combined = [...recentLogs, ...recentTickets].sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0, 15);
        setActivities(combined);
      } catch (err) {
        setError(err.message || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    try {
      sse = analyticsService.subscribeToEvents((event) => {
        setSseConnected(true);
        
        if (event.type === 'USER_BALANCE_UPDATED' || event.type === 'TICKET_PURCHASED') {
          analyticsService.getStats().then(setStats);
        }
        
        if (event.type === 'NEW_AUDIT_LOG') {
          setActivities(prev => [{
            id: event.data._id,
            type: 'LOG',
            msg: `Live: ${event.data.action}`,
            time: new Date(event.data.createdAt).toLocaleTimeString()
          }, ...prev].slice(0, 15));
        }
        
        if (event.type === 'TICKET_PURCHASED') {
          setActivities(prev => [{
            id: event.data._id,
            type: 'TICKET',
            msg: `Live Ticket Sale: ${event.data.ticketId}`,
            time: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 15));
        }
      }, () => setSseConnected(false));
    } catch (e) {
      console.error("SSE connection failed", e);
    }

    return () => {
      if (sse) sse.close();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader className="animate-spin" size={48} color="var(--accent)" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Badge variant="error" style={{ padding: '1rem', fontSize: '1rem' }}>
          Failed to load dashboard: {error}
        </Badge>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
          Overview
        </h1>
        <Badge variant={sseConnected ? 'success' : 'error'} style={{ padding: '0.5rem 1rem' }}>
          <span style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: 'currentColor',
            marginRight: '8px',
            boxShadow: sseConnected ? '0 0 8px currentColor' : 'none'
          }} />
          {sseConnected ? 'Live Sync Active' : 'Live Sync Disconnected'}
        </Badge>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Total Revenue" 
          value={`LKR ${stats?.totalRevenue?.toLocaleString() || 0}`} 
          icon={<DollarSign color="var(--success)" />} 
        />
        <StatCard 
          title="Total Users" 
          value={stats?.totalUsers?.toLocaleString() || 0} 
          icon={<Users color="var(--info)" />} 
        />
        <StatCard 
          title="Active Draws" 
          value={stats?.activeDraws || 0} 
          icon={<Activity color="var(--warning)" />} 
        />
        <StatCard 
          title="Tickets Sold" 
          value={stats?.totalTickets?.toLocaleString() || 0} 
          icon={<Ticket color="var(--accent)" />} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
        <Card style={{ gridColumn: 'span 2' }}>
          <CardHeader title="Revenue Over Time" />
          <CardBody style={{ height: '350px', padding: '1.5rem 0' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.chartData || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} tickFormatter={(val) => `Rs${val}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: 'var(--radius-md)', 
                    border: '1px solid var(--border-light)', 
                    background: 'var(--bg-elevated)',
                    boxShadow: 'var(--shadow-lg)',
                    color: 'var(--text-main)'
                  }} 
                  itemStyle={{ color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="rev" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <CardHeader 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={18} color="var(--accent)" /> Live Activity
              </div>
            } 
          />
          <CardBody style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', padding: 0 }}>
            {activities.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Waiting for activity...
              </div>
            ) : (
              <ul style={{ listStyle: 'none' }}>
                {activities.map((act, i) => (
                  <li 
                    key={`${act.id}-${i}`} 
                    style={{ 
                      padding: '1rem 1.5rem', 
                      borderBottom: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.25rem'
                    }}
                  >
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-main)' }}>{act.msg}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{act.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;