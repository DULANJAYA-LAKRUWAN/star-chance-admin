import React, { useEffect, useState } from 'react';
import { drawService } from '../services/draw.service';
import { analyticsService } from '../services/analytics.service';
import { Play, Plus, Loader, Trash2, Calendar } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const DrawsPage = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDraws = async () => {
    try {
      setLoading(true);
      const data = await drawService.getAllDraws();
      setDraws(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDraws();

    const sse = analyticsService.subscribeToEvents((event) => {
      if (event.type === 'DRAW_CREATED' || event.type === 'DRAW_DELETED' || event.type === 'DRAW_SETTLED') {
        fetchDraws();
      }
    });

    return () => sse.close();
  }, []);

  const handleCreateDraw = async () => {
    try {
      await drawService.createDraw({
        drawId: `DRAW-${Date.now().toString().slice(-6)}`,
        drawDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        ticketPrice: 20
      });
    } catch (e) {
      alert('Failed to create draw');
    }
  };

  const handleExecuteDraw = async (drawId) => {
    if (window.confirm(`Are you sure you want to FORCE SETTLE draw ${drawId}?`)) {
      try {
        await drawService.executeManualDraw(drawId);
        alert('Draw settlement executed successfully.');
      } catch (e) {
        alert('Failed to execute draw');
      }
    }
  };

  const handleDeleteDraw = async (drawId) => {
    if (window.confirm('Delete this draw forever?')) {
      try {
        await drawService.deleteDraw(drawId);
      } catch (e) {
        alert('Failed to delete draw');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Lottery Draws</h1>
        <Button onClick={handleCreateDraw} icon={<Plus size={18} />}>
          Create Next Draw
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ padding: '3rem', gridColumn: '1 / -1', textAlign: 'center' }}><Loader className="animate-spin" size={48} color="var(--accent)" /></div>
        ) : draws.map(draw => (
          <Card key={draw._id} style={{ display: 'flex', flexDirection: 'column' }}>
            <CardHeader 
              style={{ background: draw.status === 'OPEN' ? 'var(--info-bg)' : 'var(--bg-surface-hover)' }}
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', borderRadius: '0.5rem', background: 'var(--bg-surface)', color: draw.status === 'OPEN' ? 'var(--info)' : 'var(--text-muted)' }}>
                    <Calendar size={20} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.125rem' }}>{draw.drawId}</span>
                    <Badge variant={draw.status === 'OPEN' ? 'info' : 'neutral'}>{draw.status}</Badge>
                  </div>
                </div>
              }
              action={
                <button onClick={() => handleDeleteDraw(draw._id)} className="btn-icon" style={{ color: 'var(--error)' }} title="Delete Draw">
                  <Trash2 size={20} />
                </button>
              }
            />
            
            <CardBody style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Scheduled For</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{new Date(draw.drawDate).toLocaleDateString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Tickets Sold</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{draw.ticketsSold?.toLocaleString() || 0}</span>
              </div>
              {draw.winningNumbers && draw.winningNumbers.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Winning Numbers</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {draw.winningNumbers.map((num, idx) => (
                      <span key={idx} style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{num}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>

            {draw.status === 'OPEN' && (
              <div style={{ padding: '1rem', background: 'var(--bg-surface-hover)', borderTop: '1px solid var(--border-light)' }}>
                <Button variant="primary" style={{ width: '100%' }} onClick={() => handleExecuteDraw(draw.drawId)} icon={<Play size={16} fill="currentColor" />}>
                  Force Settle Now
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DrawsPage;