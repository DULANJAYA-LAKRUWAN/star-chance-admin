import React, { useEffect, useState } from 'react';
import { analyticsService } from '../services/analytics.service';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Check, X, Loader, CreditCard } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { StatCard } from '../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const PaymentsPage = () => {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([
    { id: 'W-9810', user: 'Amara de Silva', amount: 5000, bank: 'Commercial Bank', account: '8091******', status: 'Pending' },
    { id: 'W-9811', user: 'Nimal Perera', amount: 12000, bank: 'HNB Bank', account: '1092******', status: 'Pending' },
    { id: 'W-9812', user: 'Kavinda Bandara', amount: 3500, bank: 'BOC Bank', account: '7721******', status: 'Approved' }
  ]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await analyticsService.getStats();
        setStats(statsData);

        const ticketsData = await analyticsService.getRecentTickets();
        setTransactions(ticketsData);
      } catch (err) {
        console.error('Payments error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleWithdrawalAction = (id, action) => {
    setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: action } : w));
    if(action === 'Approved') {
      showToast(`Withdrawal ${id} approved`, 'success');
    } else {
      showToast(`Withdrawal ${id} rejected`, 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>Payments & Ledger</h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Track revenue, analyze payouts, and verify client withdrawals</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem' }}><Loader className="animate-spin" size={48} color="var(--accent)" /></div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            <StatCard 
              title="Gross Revenue" 
              value={`LKR ${stats?.totalRevenue?.toLocaleString() || 0}`} 
              icon={<ArrowUpRight color="var(--success)" />} 
            />
            <StatCard 
              title="Total Paid Out" 
              value={`LKR ${stats?.totalPaidOut?.toLocaleString() || 0}`} 
              icon={<ArrowDownLeft color="var(--error)" />} 
            />
            <StatCard 
              title="Net Profit Ledger" 
              value={`LKR ${stats?.netProfit?.toLocaleString() || 0}`} 
              icon={<DollarSign color="var(--accent)" />} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {/* Recent Ticket Purchases */}
            <Card style={{ flex: 2, minWidth: '300px' }}>
              <CardHeader title="Recent Ticket Purchases" />
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount (LKR)</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx._id}>
                        <td>
                          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tx.userId?.userName || 'Unknown'}</div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>20.00</td>
                        <td>
                          <Badge variant={tx.status === 'WINNER' ? 'success' : 'neutral'}>
                            {tx.status || 'ACTIVE'}
                          </Badge>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {transactions.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No ticket purchases.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Withdrawal Approvals Drawer */}
            <Card style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
              <CardHeader 
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard size={20} color="var(--accent)" /> Pending Payouts
                  </div>
                } 
              />
              <CardBody style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {withdrawals.map((w) => (
                  <div key={w.id} style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{w.user}</span>
                      <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '0.95rem' }}>LKR {w.amount.toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>{w.bank}</div>
                        <div style={{ fontFamily: 'var(--font-mono)' }}>Acc: {w.account}</div>
                      </div>

                      {w.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleWithdrawalAction(w.id, 'Approved')} className="btn-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }} title="Approve"><Check size={16} /></button>
                          <button onClick={() => handleWithdrawalAction(w.id, 'Rejected')} className="btn-icon" style={{ background: 'var(--error-bg)', color: 'var(--error)' }} title="Reject"><X size={16} /></button>
                        </div>
                      ) : (
                        <Badge variant={w.status === 'Approved' ? 'success' : 'error'}>{w.status}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentsPage;
