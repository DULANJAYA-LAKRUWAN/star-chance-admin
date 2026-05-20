import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(email, password);
      showToast('Welcome back to Star Chance Admin!', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Invalid admin credentials.';
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
      showToast('Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="admin-badge">
            <Shield size={14} /> SECURE ADMIN PORTAL
          </div>
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to manage the Star Chance platform</p>
        </div>

        {error && (
          <div className="form-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            type="email"
            placeholder="admin@starchance.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            icon={Shield}
          />

          <div className="password-field">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Administrator Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              icon={Lock}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="form-footer">
            <Link to="/forgot-password" className="link-secondary">
              Forgot Password?
            </Link>
          </div>

          <Button type="submit" isLoading={loading} className="full-width-btn">
            Authorize Access
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
