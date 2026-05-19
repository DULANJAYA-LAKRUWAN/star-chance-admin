import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your admin email.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      showToast('OTP sent to your email', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP. Ensure email is correct.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/verify-otp', { email, otp });
      showToast('OTP Verified!', 'success');
      navigate('/reset-password', { state: { email, resetToken: res.data.resetToken } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid or expired OTP.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem', textDecoration: 'none', fontWeight: 500 }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

        <div className="login-header">
          <div className="admin-badge">
            <Shield size={14} /> RECOVERY
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.5rem 0', color: 'var(--text-main)' }}>
            {step === 1 ? 'Reset Password' : 'Enter OTP'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {step === 1 ? 'Enter your admin email to receive a secure OTP.' : `Enter the 6-digit OTP sent to ${email}`}
          </p>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--error-bg)', color: 'var(--error)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500 }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Input
              type="email"
              placeholder="admin@starchance.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
            <Button type="submit" isLoading={loading} style={{ width: '100%', padding: '0.875rem' }}>
              Send Recovery OTP
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              required
              maxLength={6}
              style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.2em' }}
            />
            <Button type="submit" isLoading={loading} style={{ width: '100%', padding: '0.875rem' }}>
              Verify OTP
            </Button>
            <div style={{ textAlign: 'center' }}>
              <button type="button" onClick={() => setStep(1)} disabled={loading} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}>
                Change Email Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
