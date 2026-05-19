import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Settings, Bell, Loader, Shield, Save } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    isMaintenanceMode: false,
    minTicketPrice: 20,
    defaultJackpot: 100000,
    globalAnnouncement: '',
    appVersion: '1.0.0'
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);
  
  const { showToast } = useToast();

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data) {
        setSettings(response.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load system settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleToggleMaintenance = () => {
    setSettings(prev => ({ ...prev, isMaintenanceMode: !prev.isMaintenanceMode }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: name === 'minTicketPrice' || name === 'defaultJackpot' ? Number(value) : value
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await api.post('/admin/settings', settings);
      showToast('System settings updated successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleBroadcastNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle || !notifBody) {
      showToast('Please fill in both title and body fields.', 'error');
      return;
    }

    try {
      setSendingNotif(true);
      await api.post('/admin/notify-all', { title: notifTitle, body: notifBody });
      showToast('Push notifications dispatched successfully!', 'success');
      setNotifTitle('');
      setNotifBody('');
    } catch (err) {
      console.error(err);
      showToast('Failed to dispatch notifications', 'error');
    } finally {
      setSendingNotif(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Loader className="animate-spin" size={48} color="var(--accent)" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>System Configuration</h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Tune lottery rules, maintenance options, and broadcast push notifications</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        {/* Settings Form */}
        <Card>
          <CardHeader 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Settings size={20} color="var(--accent)" /> Global Platform Settings
              </div>
            } 
          />
          <CardBody>
            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Maintenance Toggle */}
              <div
                onClick={handleToggleMaintenance}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)', cursor: 'pointer'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={16} color={settings.isMaintenanceMode ? 'var(--error)' : 'var(--success)'} />
                    Maintenance Lock
                  </span>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Locks client application endpoints completely
                  </span>
                </div>
                <div style={{
                  width: '44px', height: '24px', borderRadius: '12px',
                  background: settings.isMaintenanceMode ? 'var(--error)' : 'var(--border-bright)',
                  position: 'relative', transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '3px', left: settings.isMaintenanceMode ? '23px' : '3px',
                    transition: 'left 0.2s'
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <Input
                  label="Ticket Price (LKR)"
                  type="number"
                  name="minTicketPrice"
                  value={settings.minTicketPrice}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Jackpot Default (LKR)"
                  type="number"
                  name="defaultJackpot"
                  value={settings.defaultJackpot}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Global Announcement Text</label>
                <textarea
                  name="globalAnnouncement"
                  value={settings.globalAnnouncement}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <Input
                label="App Production Version"
                type="text"
                name="appVersion"
                value={settings.appVersion}
                onChange={handleInputChange}
                required
              />

              <Button type="submit" isLoading={savingSettings} icon={!savingSettings && <Save size={18} />}>
                Save Configuration
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Push Notification Panel */}
        <Card style={{ height: 'fit-content' }}>
          <CardHeader 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={20} color="var(--accent)" /> Global Announcement Broadcast
              </div>
            } 
          />
          <CardBody>
            <form onSubmit={handleBroadcastNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Input
                label="Announcement Title"
                placeholder="e.g. Draw execution alert"
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Announcement Message Body</label>
                <textarea
                  placeholder="e.g. Draw results are out! View winning combinations."
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  rows={4}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <Button type="submit" isLoading={sendingNotif} icon={!sendingNotif && <Bell size={18} />}>
                Broadcast Now
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
