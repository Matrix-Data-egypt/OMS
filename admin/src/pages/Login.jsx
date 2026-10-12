import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'sales') {
        navigate('/briefs');
      } else if (user.role === 'data_entry') {
        navigate('/videos');
      } else {
        navigate('/briefs');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '480px' }}>
        <div className="login-brand">
          <div className="login-logo">O</div>
          <div>
            <strong>OMS Advertising</strong>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--muted)' }}>Enterprise Management System</span>
          </div>
        </div>

        <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>لوحة التحكم</h1>
        <p className="sub" style={{ marginBottom: '20px', fontSize: '0.9rem' }}>
          قم بتسجيل الدخول للوصول إلى لوحة التحكم
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>اسم المستخدم (Username)</label>
            <input 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              autoComplete="username" 
              required
            />
          </div>
          <div className="field">
            <label>كلمة المرور (Password)</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading} style={{ marginTop: '14px' }}>
            {loading ? 'جاري التحقق…' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
