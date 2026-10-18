import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error: signUpError } = await register(email, password, fullName, phone);
    
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      alert('Pendaftaran berhasil! Silakan masuk.');
      navigate('/login');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '2rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Daftar Akun Baru</h2>
      {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="text" placeholder="Nama Lengkap" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
        <input type="tel" placeholder="Nomor WhatsApp" required value={phone} onChange={(e) => setPhone(e.target.value)} style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
        <input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
        <input type="password" placeholder="Password (min 6 karakter)" required minLength="6" value={password} onChange={(e) => setPassword(e.target.value)} style={{ padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
        <button type="submit" disabled={loading} style={{ background: 'var(--success)', color: 'var(--surface)', padding: '0.8rem', border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Sudah punya akun? <Link to="/login" style={{ color: 'var(--primary)' }}>Masuk</Link></p>
    </div>
  );
}
