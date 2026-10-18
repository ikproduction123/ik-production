import { Link } from 'react-router-dom';

export default function MyInvitations() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', margin: 0 }}>Undangan Saya</h1>
        <Link to="/dashboard/invitations/new" style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary)', color: 'var(--text-primary)', textDecoration: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 'bold' }}>
          + Buat Baru
        </Link>
      </div>

      <div style={{ backgroundColor: 'var(--surface)', padding: '3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Anda belum memiliki undangan.</p>
        <Link to="/dashboard/invitations/new" style={{ color: 'var(--success)', textDecoration: 'none', fontWeight: 'bold' }}>Mulai buat undangan pertama Anda</Link>
      </div>
    </div>
  );
}
