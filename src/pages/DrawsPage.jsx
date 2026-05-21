import React, { useEffect, useState } from 'react';
import { drawService } from '../services/draw.service';
import { analyticsService } from '../services/analytics.service';
import { Play, Plus, Loader, Trash2, Calendar, DollarSign, Ticket, Trophy } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';

const getTomorrowDateTimeLocal = () => {
  const date = new Date(Date.now() + 86400000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const initialDrawForm = {
  type: 'DAILY',
  drawDate: getTomorrowDateTimeLocal(),
  ticketPrice: '20',
  jackpotAmount: '5000000',
};

const DrawsPage = () => {
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(initialDrawForm);
  const [formError, setFormError] = useState('');
  const [creating, setCreating] = useState(false);

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

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFormError('');
  };

  const handleOpenCreate = () => {
    setForm(initialDrawForm);
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleCreateDraw = async (event) => {
    event.preventDefault();
    const ticketPrice = Number(form.ticketPrice);
    const jackpotAmount = Number(form.jackpotAmount);
    const drawDate = new Date(form.drawDate);

    if (!form.type) {
      setFormError('Select a draw type.');
      return;
    }
    if (Number.isNaN(drawDate.getTime()) || drawDate <= new Date()) {
      setFormError('Draw date must be a valid future date and time.');
      return;
    }
    if (!Number.isFinite(ticketPrice) || ticketPrice <= 0) {
      setFormError('Ticket price must be greater than zero.');
      return;
    }
    if (!Number.isFinite(jackpotAmount) || jackpotAmount < 0) {
      setFormError('Jackpot amount cannot be negative.');
      return;
    }

    try {
      setCreating(true);
      await drawService.createDraw({
        drawId: `DRAW-${Date.now().toString().slice(-6)}`,
        type: form.type,
        drawDate: drawDate.toISOString(),
        ticketPrice,
        jackpotAmount,
      });
      setIsCreateOpen(false);
      await fetchDraws();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create draw.');
    } finally {
      setCreating(false);
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
        <Button onClick={handleOpenCreate} icon={<Plus size={18} />}>
          Create Draw
        </Button>
      </div>

      <Modal isOpen={isCreateOpen} onClose={() => !creating && setIsCreateOpen(false)} title="Create Lottery Draw" maxWidth="640px">
        <form onSubmit={handleCreateDraw} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}>
            <div className="input-wrapper">
              <label className="input-label" htmlFor="draw-type">Draw Type</label>
              <div className="input-field-group with-icon">
                <div className="input-icon"><Ticket size={18} /></div>
                <select
                  id="draw-type"
                  className="input-field"
                  value={form.type}
                  onChange={(event) => updateForm('type', event.target.value)}
                  required
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="SPECIAL">Special</option>
                </select>
              </div>
            </div>

            <Input
              label="Draw Date & Time"
              type="datetime-local"
              icon={Calendar}
              value={form.drawDate}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              onChange={(event) => updateForm('drawDate', event.target.value)}
              required
            />

            <Input
              label="Ticket Price"
              type="number"
              min="1"
              step="1"
              icon={DollarSign}
              value={form.ticketPrice}
              onChange={(event) => updateForm('ticketPrice', event.target.value)}
              required
            />

            <Input
              label="Jackpot Amount"
              type="number"
              min="0"
              step="100"
              icon={Trophy}
              value={form.jackpotAmount}
              onChange={(event) => updateForm('jackpotAmount', event.target.value)}
              required
            />
          </div>

          {formError && (
            <div style={{
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              background: 'var(--error-bg)',
              color: 'var(--error)',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}>
              {formError}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)} disabled={creating}>
              Cancel
            </Button>
            <Button type="submit" isLoading={creating} icon={<Plus size={18} />}>
              Create Draw
            </Button>
          </div>
        </form>
      </Modal>

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
