import React, { useEffect, useState } from 'react';
import { userService } from '../services/user.service';
import { analyticsService } from '../services/analytics.service';
import { Search, Loader, Wallet, ShieldAlert } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (q = '') => {
    try {
      setLoading(true);
      const data = await userService.getUsers(q);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search);

    const sse = analyticsService.subscribeToEvents((event) => {
      if (event.type === 'USER_BALANCE_UPDATED') {
        setUsers(prev => prev.map(u => u._id === event.data.userId ? { ...u, balance: event.data.balance } : u));
      }
    });

    return () => sse.close();
  }, [search]);

  const handleAddBalance = async (userId, currentBalance) => {
    const amount = prompt('Enter amount to add to balance:');
    if (amount && !isNaN(amount)) {
      try {
        await userService.updateBalance(userId, Number(amount));
        alert('Balance updated successfully');
      } catch (e) {
        alert('Failed to update balance');
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Users Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <Search color="var(--text-muted)" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '250px', color: 'var(--text-main)' }}
          />
        </div>
      </div>

      <Card>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Balance (LKR)</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem' }}><Loader className="animate-spin" size={32} color="var(--accent)" /></td></tr>
              ) : users.map(user => (
                <tr key={user._id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user.userName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user.email}</div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>{user.balance?.toLocaleString() || 0}</td>
                  <td>
                    <Badge variant="success">Active</Badge>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <Button variant="secondary" size="sm" onClick={() => handleAddBalance(user._id, user.balance)} title="Add Balance">
                        <Wallet size={16} />
                      </Button>
                      <Button variant="danger" size="sm" title="Ban User">
                        <ShieldAlert size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default UsersPage;