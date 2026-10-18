import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { PlusSquare, Mail } from 'lucide-react';

export default function Overview() {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-primary)', marginBottom: '2rem' }}>Selamat datang kembali, {user?.user_metadata?.full_name}!</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Card Buat Undangan */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--warning)' }}>
            <PlusSquare size={32} />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Buat Undangan Baru</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Pilih paket dan tema untuk memulai undangan digital Anda.</p>
          <Link to="/dashboard/invitations/new" style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
            Buat Sekarang
          </Link>
        </div>

        {/* Card Undangan Aktif */}
        <div style={{ backgroundColor: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ backgroundColor: '#e0f2f1', padding: '1rem', borderRadius: '50%', marginBottom: '1rem', color: 'var(--success)' }}>
            <Mail size={32} />
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>Undangan Saya</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Kelola undangan, lihat daftar tamu, dan pantau RSVP Anda.</p>
          <Link to="/dashboard/invitations" style={{ padding: '0.6rem 1.2rem', backgroundColor: 'transparent', border: '1px solid var(--success)', color: 'var(--success)', textDecoration: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
            Lihat Undangan
          </Link>
        </div>

      </div>
    </div>
  );
}
