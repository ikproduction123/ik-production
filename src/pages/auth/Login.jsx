import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: signInError } = await login(email, password);
    
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Masuk ke IK-Pro.My.Id</h2>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
        <input type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
        <button type="submit" disabled={loading} style={{ background: 'var(--primary)', color: 'var(--text-primary)', padding: '0.8rem', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Belum punya akun? <Link to="/register" style={{ color: 'var(--success)' }}>Daftar</Link></p>
    </div>
  );
}
