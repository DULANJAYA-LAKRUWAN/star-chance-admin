import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Ticket as TicketIcon, TrendingUp, Calendar, Settings as SettingsIcon, LogOut, ShieldCheck,
  RefreshCw, PlusCircle, PlayCircle, Bell, Plus, X, Send, Lock, Mail, Search, Trash2, ChevronRight,
  DollarSign, AlertTriangle, Zap, Clock, Save, CheckCircle2, Eye, Wallet
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7747';
const ADMIN_API = `${BASE_URL}/admin`;

const Modal = ({ isOpen, onClose, title, children, width = '500px' }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="empty-state">
    <Icon size={48} opacity={0.3} />
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

const LoadingSkeleton = ({ rows = 5 }) => (
  <div className="loading-skeleton">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="skeleton-row" />
    ))}
  </div>
);

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'var(--accent)', trend }) => (
  <div className="stat-card">
    <div className="stat-header">
      <span className="stat-title">{title}</span>
      <Icon size={18} color={color} />
    </div>
    <div className="stat-value" style={{ color: color }}>{value}</div>
    {subtitle && <div className={`stat-change ${trend === 'up' ? 'up' : trend === 'down' ? 'down' : ''}`}>{subtitle}</div>}
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalTickets: 0, totalRevenue: 0, totalPaidOut: 0, netProfit: 0, activeDraws: 0, newUsersLastWeek: 0, chartData: [] });
  const [users, setUsers] = useState([]);
  const [draws, setDraws] = useState([]);
  const [logs, setLogs] = useState([]);
  const [feed, setFeed] = useState({ logs: [], tickets: [] });
  const [settings, setSettings] = useState({ isMaintenanceMode: false, minTicketPrice: 20, defaultJackpot: 100000, globalAnnouncement: '', appVersion: '1.0.0' });
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isCreateDrawOpen, setIsCreateDrawOpen] = useState(false);
  const [isUpdateBalanceOpen, setIsUpdateBalanceOpen] = useState(false);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    if (!token) return;
    
    let isMounted = true;
    
    const loadData = async () => {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      try {
        if (activeTab === 'overview') {
          const [statsRes, feedRes] = await Promise.all([
            axios.get(`${ADMIN_API}/stats`, config),
            axios.get(`${ADMIN_API}/feed`, config)
          ]);
          if (isMounted) {
            setStats(statsRes.data);
            setFeed(feedRes.data);
          }
        } else if (activeTab === 'users') {
          const res = await axios.get(`${ADMIN_API}/users?search=${encodeURIComponent(searchQuery)}`, config);
          if (isMounted) setUsers(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'draws') {
          const res = await axios.get(`${ADMIN_API}/draws`, config);
          if (isMounted) setDraws(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'logs') {
          const res = await axios.get(`${ADMIN_API}/logs`, config);
          if (isMounted) setLogs(Array.isArray(res.data) ? res.data : []);
        } else if (activeTab === 'settings') {
          const res = await axios.get(`${ADMIN_API}/settings`, config);
          if (isMounted) setSettings(res.data);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        if (isMounted) {
          if (error.response?.status === 401) {
            setToken('');
            localStorage.removeItem('adminToken');
            showToast('Session expired. Please login again.', 'error');
          } else {
            showToast('Failed to fetch data', 'error');
          }
        }
      }
      if (isMounted) setLoading(false);
    };
    
    loadData();
    
    return () => { isMounted = false; };
  }, [activeTab, token, searchQuery]);

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      if (activeTab === 'overview') {
        const [statsRes, feedRes] = await Promise.all([
          axios.get(`${ADMIN_API}/stats`, config),
          axios.get(`${ADMIN_API}/feed`, config)
        ]);
        setStats(statsRes.data);
        setFeed(feedRes.data);
      } else if (activeTab === 'users') {
        const res = await axios.get(`${ADMIN_API}/users?search=${encodeURIComponent(searchQuery)}`, config);
        setUsers(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'draws') {
        const res = await axios.get(`${ADMIN_API}/draws`, config);
        setDraws(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'logs') {
        const res = await axios.get(`${ADMIN_API}/logs`, config);
        setLogs(Array.isArray(res.data) ? res.data : []);
      } else if (activeTab === 'settings') {
        const res = await axios.get(`${ADMIN_API}/settings`, config);
        setSettings(res.data);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      if (error.response?.status === 401) {
        setToken('');
        localStorage.removeItem('adminToken');
        showToast('Session expired. Please login again.', 'error');
      } else {
        showToast('Failed to fetch data', 'error');
      }
    }
    setLoading(false);
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...settings,
        minTicketPrice: Number(settings.minTicketPrice),
        defaultJackpot: Number(settings.defaultJackpot)
      };
      await axios.post(`${ADMIN_API}/settings`, payload, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Settings updated successfully!');
    } catch {
      showToast('Failed to update settings', 'error');
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await axios.post(`${BASE_URL}/auth/signin`, loginData);
      const { accessToken, user } = res.data;
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        setLoginError('Access Denied. Admin privileges required.');
        setLoading(false);
        return;
      }
      setToken(accessToken);
      localStorage.setItem('adminToken', accessToken);
      showToast('Welcome back, Admin!');
    } catch (err) {
      setLoginError(err.response?.status === 401 ? 'Invalid credentials' : 'Login failed. Please try again.');
    }
    setLoading(false);
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      await axios.post(
        `${ADMIN_API}/notify-all`,
        { title: formData.get('title'), body: formData.get('body') },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Broadcast sent successfully!');
      setIsBroadcastOpen(false);
      e.target.reset();
    } catch {
      showToast('Failed to send broadcast', 'error');
    }
  };

  const handleCreateDraw = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      drawDate: formData.get('drawDate'),
      ticketPrice: parseInt(formData.get('ticketPrice')),
      jackpotAmount: parseInt(formData.get('jackpot')),
      type: 'DAILY',
      drawId: `D-${Date.now()}`
    };
    try {
      await axios.post(`${ADMIN_API}/draws`, data, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Draw created successfully!');
      setIsCreateDrawOpen(false);
      fetchData();
    } catch {
      showToast('Failed to create draw', 'error');
    }
  };

  const handleExecuteDraw = async (drawId) => {
    if (!confirm('Execute draw settlement now? This action cannot be undone.')) return;
    try {
      await axios.post(`${ADMIN_API}/draws/${drawId}/execute`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Draw settled successfully!');
      fetchData();
    } catch {
      showToast('Execution failed', 'error');
    }
  };

  const handleDeleteDraw = async (drawId) => {
    if (!confirm('Permanently delete this draw? This action cannot be undone.')) return;
    try {
      await axios.delete(`${ADMIN_API}/draws/${drawId}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast('Draw deleted successfully.');
      fetchData();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const openUserDetail = async (userId) => {
    try {
      const res = await axios.get(`${ADMIN_API}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedUser(res.data);
      setIsUserDetailOpen(true);
    } catch {
      showToast('Failed to fetch user details', 'error');
    }
  };

  const handleUpdateBalance = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const amount = parseFloat(formData.get('amount'));
    if (isNaN(amount)) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    try {
      await axios.post(
        `${ADMIN_API}/users/${selectedUser.user._id}/balance`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Balance updated successfully!');
      setIsUpdateBalanceOpen(false);
      fetchData();
    } catch {
      showToast('Error updating balance', 'error');
    }
  };

  const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { dateStyle: 'long' });
  const formatTime = (date) => new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (!token) {
    return (
      <div className="login-container">
        <div className="login-background" />
        <div className="login-box">
          <div className="login-header">
            <div className="admin-badge">
              <ShieldCheck size={16} />
              <span>ADMINISTRATOR</span>
            </div>
            <h1 className="logo-text">STAR CHANCE</h1>
            <p>Enterprise Management Portal</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            {loginError && (
              <div className="error-banner">
                <AlertTriangle size={16} />
                <span>{loginError}</span>
              </div>
            )}
            <div className="input-group">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                placeholder="Admin Email"
                required
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
            </div>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                placeholder="Password"
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
              {loading ? <RefreshCw size={20} className="animate-spin" /> : 'Sign In to Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const tabTitles = {
    overview: 'Control Center',
    users: 'User Directory',
    draws: 'Draw Management',
    logs: 'Audit Logs',
    settings: 'System Settings'
  };

  return (
    <div className="dashboard-container">
      {toast.show && (
        <div className={`toast-container ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      <aside className="sidebar">
        <div className="logo">
          <Zap size={22} color="var(--accent)" />
          <span>STAR CHANCE</span>
        </div>
        <nav>
          <div className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <TrendingUp size={18} />
            <span>Overview</span>
          </div>
          <div className={`nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Users size={18} />
            <span>User Hub</span>
          </div>
          <div className={`nav-item ${activeTab === 'draws' ? 'active' : ''}`} onClick={() => setActiveTab('draws')}>
            <Calendar size={18} />
            <span>Draw Engine</span>
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <ShieldCheck size={18} />
            <span>Audit Logs</span>
          </div>
          <div className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <SettingsIcon size={18} />
            <span>System</span>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button onClick={() => setIsBroadcastOpen(true)} className="btn btn-primary broadcast-btn">
            <Bell size={18} />
            <span>Broadcast</span>
          </button>
          <div className="nav-item logout" onClick={() => { setToken(''); localStorage.removeItem('adminToken'); }}>
            <LogOut size={18} />
            <span>Logout</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="header">
          <div className="header-info">
            <h1>{tabTitles[activeTab]}</h1>
            <p>
              <span className={`status-dot ${loading ? 'syncing' : 'online'}`} />
              {loading ? 'Synchronizing...' : 'All systems operational'}
            </p>
          </div>
          <div className="header-actions">
            <button className="btn btn-sync" onClick={fetchData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="overview-layout">
            <div className="overview-main">
              <section className="stats-grid">
                <StatCard
                  title="Active Users"
                  value={stats.totalUsers}
                  subtitle={`+${stats.newUsersLastWeek} weekly growth`}
                  icon={Users}
                  trend="up"
                />
                <StatCard
                  title="Gross Revenue"
                  value={formatCurrency(stats.totalRevenue)}
                  icon={DollarSign}
                  color="var(--success)"
                />
                <StatCard
                  title="Total Paid Out"
                  value={formatCurrency(stats.totalPaidOut)}
                  icon={Wallet}
                  color="#60a5fa"
                />
                <StatCard
                  title="Net Profit"
                  value={formatCurrency(stats.netProfit)}
                  icon={Zap}
                  color={stats.netProfit >= 0 ? 'var(--accent)' : 'var(--error)'}
                  trend={stats.netProfit >= 0 ? 'up' : 'down'}
                />
              </section>

              <div className="chart-card card">
                <h2 className="card-title">
                  <TrendingUp size={20} color="var(--accent)" />
                  Performance Analytics
                </h2>
                {stats.chartData && stats.chartData.length > 0 ? (
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <AreaChart data={stats.chartData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="var(--text-muted)" axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-bright)',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="rev"
                          stroke="var(--accent)"
                          fillOpacity={1}
                          fill="url(#colorRev)"
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="chart-placeholder">
                    <TrendingUp size={48} opacity={0.2} />
                    <p>No analytics data available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="overview-sidebar">
              <div className="card activity-card">
                <h3 className="card-title">
                  <Clock size={18} color="var(--accent)" />
                  Real-time Activity
                </h3>
                {feed.tickets.length > 0 || feed.logs.length > 0 ? (
                  <div className="feed-list">
                    {feed.tickets.slice(0, 5).map((t, i) => (
                      <div key={`t-${i}`} className="feed-item">
                        <div className="feed-icon">
                          <TicketIcon size={14} />
                        </div>
                        <div className="feed-text">
                          <strong>{t.userId?.userName || 'User'}</strong> purchased a ticket
                          <span>{formatTime(t.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                    {feed.logs.slice(0, 3).map((l, i) => (
                      <div key={`l-${i}`} className="feed-item">
                        <div className="feed-icon">
                          <ShieldCheck size={14} />
                        </div>
                        <div className="feed-text">
                          <strong>System</strong> {l.action}
                          <span>{formatTime(l.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="feed-empty">
                    <Clock size={32} opacity={0.3} />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>

              <div className="quick-actions-card card">
                <h3 className="card-title">
                  <Zap size={18} color="var(--accent)" />
                  Quick Actions
                </h3>
                <div className="action-buttons-stack">
                  <button className="btn btn-primary" onClick={() => setIsCreateDrawOpen(true)}>
                    <Plus size={16} />
                    <span>New Draw</span>
                  </button>
                  <button className="btn btn-sync" onClick={() => setIsBroadcastOpen(true)}>
                    <Bell size={16} />
                    <span>Broadcast</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="card">
            <div className="card-header-flex">
              <h2 className="card-title">
                <Users size={20} color="var(--accent)" />
                User Directory
              </h2>
              <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                />
              </div>
            </div>

            {loading ? (
              <LoadingSkeleton rows={5} />
            ) : users.length === 0 ? (
              <EmptyState icon={Users} title="No users found" description="Users will appear here once they register." />
            ) : (
              <div className="table-wrapper">
                <table className="real-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Balance</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="user-info-cell" onClick={() => openUserDetail(u._id)}>
                            <div className="user-avatar">{u.userName?.charAt(0).toUpperCase() || 'U'}</div>
                            <span className="user-name">{u.userName}</span>
                            <ChevronRight size={14} opacity={0.5} />
                          </div>
                        </td>
                        <td>{u.email}</td>
                        <td>
                          <span className="balance-text">{formatCurrency(u.balance)}</span>
                        </td>
                        <td>{u.createdAt ? formatDate(u.createdAt) : 'N/A'}</td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-icon" onClick={() => { setSelectedUser({ user: u }); setIsUpdateBalanceOpen(true); }} title="Update Balance">
                              <PlusCircle size={18} />
                            </button>
                            <button className="btn-icon" onClick={() => openUserDetail(u._id)} title="View Details">
                              <Eye size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'draws' && (
          <div className="card">
            <div className="card-header-flex">
              <h2 className="card-title">
                <Calendar size={20} color="var(--accent)" />
                Draw Schedule
              </h2>
              <button className="btn btn-primary btn-sm" onClick={() => setIsCreateDrawOpen(true)}>
                <Plus size={16} />
                <span>Create Draw</span>
              </button>
            </div>

            {loading ? (
              <LoadingSkeleton rows={5} />
            ) : draws.length === 0 ? (
              <EmptyState icon={Calendar} title="No draws scheduled" description="Create a new draw to get started." />
            ) : (
              <div className="table-wrapper">
                <table className="real-table">
                  <thead>
                    <tr>
                      <th>Draw Date</th>
                      <th>Jackpot</th>
                      <th>Ticket Price</th>
                      <th>Status</th>
                      <th>Entries</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draws.map(d => (
                      <tr key={d._id}>
                        <td className="date-cell">{formatDate(d.drawDate)}</td>
                        <td>
                          <strong className="jackpot-value">{formatCurrency(d.jackpotAmount)}</strong>
                        </td>
                        <td>{formatCurrency(d.ticketPrice)}</td>
                        <td>
                          <span className={`status-badge ${d.status === 'SETTLED' ? 'status-settled' : d.status === 'OPEN' ? 'status-open' : 'status-cancelled'}`}>
                            {d.status}
                          </span>
                        </td>
                        <td>
                          <span className="entries-count">{d.ticketsSold || 0}</span>
                          <span className="entries-label">entries</span>
                        </td>
                        <td>
                          <div className="table-actions">
                            {d.status === 'OPEN' && (
                              <button className="btn-icon action-btn" onClick={() => handleExecuteDraw(d._id)} title="Execute Draw">
                                <PlayCircle size={18} />
                              </button>
                            )}
                            <button className="btn-icon delete-btn" onClick={() => handleDeleteDraw(d._id)} title="Delete Draw">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="card">
            <h2 className="card-title">
              <ShieldCheck size={20} color="var(--accent)" />
              Audit Trail
            </h2>

            {loading ? (
              <LoadingSkeleton rows={5} />
            ) : logs.length === 0 ? (
              <EmptyState icon={ShieldCheck} title="No audit logs" description="System activities will be logged here." />
            ) : (
              <div className="log-list">
                {logs.map((log, i) => (
                  <div key={i} className="log-item">
                    <div className="log-icon">
                      <ShieldCheck size={20} color="var(--accent)" />
                    </div>
                    <div className="log-details">
                      <div className="log-header">
                        <strong className="log-action">{log.action}</strong>
                        <span className="log-time">{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="log-meta">Actor: {log.adminEmail || 'System'}</p>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <pre className="log-payload">{JSON.stringify(log.details, null, 2)}</pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-layout">
            <div className="card settings-card">
              <h2 className="card-title">
                <SettingsIcon size={20} color="var(--accent)" />
                System Configuration
              </h2>
              <form onSubmit={handleUpdateSettings} className="admin-form">
                <div className="form-section">
                  <h3 className="section-title">System Status</h3>
                  <div className="form-group">
                    <label>System Mode</label>
                    <div
                      className="toggle-container"
                      onClick={() => setSettings({ ...settings, isMaintenanceMode: !settings.isMaintenanceMode })}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSettings({ ...settings, isMaintenanceMode: !settings.isMaintenanceMode })}
                    >
                      <div className={`toggle-switch ${settings.isMaintenanceMode ? 'on' : 'off'}`} />
                      <span className="toggle-label">
                        {settings.isMaintenanceMode ? (
                          <span className="maintenance-text"><AlertTriangle size={16} /> Maintenance Mode Active</span>
                        ) : (
                          <span className="live-text"><CheckCircle2 size={16} /> Live Mode Active</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Pricing Configuration</h3>
                  <div className="settings-row">
                    <div className="form-group">
                      <label htmlFor="minTicketPrice">Min Ticket Price (LKR)</label>
                      <input
                        id="minTicketPrice"
                        type="number"
                        min="1"
                        value={settings.minTicketPrice}
                        onChange={(e) => setSettings({ ...settings, minTicketPrice: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="defaultJackpot">Default Jackpot (LKR)</label>
                      <input
                        id="defaultJackpot"
                        type="number"
                        min="1000"
                        value={settings.defaultJackpot}
                        onChange={(e) => setSettings({ ...settings, defaultJackpot: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Communications</h3>
                  <div className="form-group">
                    <label htmlFor="announcement">Global Announcement Banner</label>
                    <textarea
                      id="announcement"
                      value={settings.globalAnnouncement}
                      onChange={(e) => setSettings({ ...settings, globalAnnouncement: e.target.value })}
                      placeholder="Message displayed to all users..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">System Info</h3>
                  <div className="form-group">
                    <label htmlFor="appVersion">Build Version</label>
                    <input
                      id="appVersion"
                      type="text"
                      value={settings.appVersion}
                      onChange={(e) => setSettings({ ...settings, appVersion: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Modal isOpen={isUserDetailOpen} onClose={() => setIsUserDetailOpen(false)} title="User Details" width="850px">
        {selectedUser && (
          <div className="user-detail-view">
            <div className="detail-header">
              <div className="detail-avatar">
                {selectedUser.user.userName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="detail-info">
                <h3>{selectedUser.user.userName}</h3>
                <p>{selectedUser.user.email}</p>
              </div>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <label>Zodiac Sign</label>
                <p>{selectedUser.user.zodiacSign || 'Not set'}</p>
              </div>
              <div className="detail-item">
                <label>Wallet Balance</label>
                <p className="balance-highlight">{formatCurrency(selectedUser.user.balance)}</p>
              </div>
              <div className="detail-item">
                <label>Join Date</label>
                <p>{selectedUser.user.createdAt ? formatDate(selectedUser.user.createdAt) : 'Unknown'}</p>
              </div>
              <div className="detail-item">
                <label>Location</label>
                <p>{selectedUser.user.cityName || 'Not specified'}</p>
              </div>
            </div>

            {selectedUser.lastTickets && selectedUser.lastTickets.length > 0 ? (
              <div className="ticket-history">
                <h3>Recent Tickets</h3>
                <div className="table-wrapper">
                  <table className="real-table mini">
                    <thead>
                      <tr>
                        <th>Draw ID</th>
                        <th>Numbers</th>
                        <th>Status</th>
                        <th>Prize</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser.lastTickets.map((t, i) => (
                        <tr key={i}>
                          <td>{t.drawId}</td>
                          <td className="numbers-cell">{t.numbers?.join(' - ') || 'N/A'}</td>
                          <td>
                            <span className={`status-badge ${t.status === 'WINNER' ? 'status-winner' : 'status-loser'}`}>
                              {t.status}
                            </span>
                          </td>
                          <td>{formatCurrency(t.prizeAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="ticket-history-empty">
                <TicketIcon size={32} opacity={0.3} />
                <p>No ticket history available</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={isBroadcastOpen} onClose={() => setIsBroadcastOpen(false)} title="Broadcast Notification">
        <form onSubmit={handleBroadcast} className="admin-form">
          <div className="form-group">
            <label htmlFor="broadcast-title">Title</label>
            <input id="broadcast-title" name="title" placeholder="Enter notification title..." required />
          </div>
          <div className="form-group">
            <label htmlFor="broadcast-body">Message</label>
            <textarea id="broadcast-body" name="body" placeholder="Enter notification message..." required rows={4} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <Send size={18} />
              <span>Send Broadcast</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isCreateDrawOpen} onClose={() => setIsCreateDrawOpen(false)} title="Create New Draw">
        <form onSubmit={handleCreateDraw} className="admin-form">
          <div className="form-group">
            <label htmlFor="draw-date">Draw Date</label>
            <input id="draw-date" name="drawDate" type="date" required min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="settings-row">
            <div className="form-group">
              <label htmlFor="ticket-price">Ticket Price (LKR)</label>
              <input id="ticket-price" name="ticketPrice" type="number" defaultValue="20" min="1" />
            </div>
            <div className="form-group">
              <label htmlFor="jackpot">Jackpot Amount (LKR)</label>
              <input id="jackpot" name="jackpot" type="number" defaultValue="100000" min="1000" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <Calendar size={18} />
              <span>Create Draw</span>
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isUpdateBalanceOpen} onClose={() => setIsUpdateBalanceOpen(false)} title="Update User Balance">
        {selectedUser && (
          <form onSubmit={handleUpdateBalance} className="admin-form">
            <div className="balance-info">
              <span>Current Balance:</span>
              <strong>{formatCurrency(selectedUser.user.balance)}</strong>
            </div>
            <div className="form-group">
              <label htmlFor="balance-amount">Amount Adjustment</label>
              <input id="balance-amount" name="amount" type="number" step="0.01" placeholder="Use + or - for credit/debit" required autoFocus />
              <p className="form-hint">Positive values add to balance, negative values deduct</p>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                <Wallet size={18} />
                <span>Update Balance</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default App;
