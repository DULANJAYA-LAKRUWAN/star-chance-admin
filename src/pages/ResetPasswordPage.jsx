import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const email = location.state?.email || '';
  const resetToken = location.state?.resetToken || '';

  useEffect(() => {
    if (!resetToken || !email) {
      showToast('Session expired or invalid reset request.', 'error');
      navigate('/forgot-password');
    }
  }, [resetToken, email, navigate, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.post('/auth/reset-password', { email, newPassword, confirmPassword, resetToken });
      setSuccess(true);
      showToast('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Failed to reset password. Token may have expired.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
      showToast('Failed to reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {!success ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <Link to="/forgot-password" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Verify OTP
              </Link>
            </div>

            <div className="login-header">
              <div className="admin-badge">
                <Lock size={14} /> NEW CREDENTIALS
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--text-main)' }}>
                Reset Password
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Set a secure new password for <strong>{email}</strong></p>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <Input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={submitting}
                required
                icon={Lock}
              />
              <Input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={submitting}
                required
                icon={Lock}
              />
              <Button type="submit" isLoading={submitting} style={{ width: '100%', padding: '0.875rem' }}>
                Update Password
              </Button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CheckCircle size={36} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)', margin: '0 0 0.5rem' }}>Success!</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your password has been updated. Redirecting to login...</p>
            <Button onClick={() => navigate('/login')} style={{ width: '100%' }}>Go to Sign In Page Now</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
