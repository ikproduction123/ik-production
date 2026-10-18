import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

export default function PublicLayout() {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <header style={{ padding: '1rem 2rem', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning)', textDecoration: 'none' }}>
          IK-Pro
        </Link>
        <nav style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="#fitur" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>Fitur</a>
          <a href="#harga" style={{ textDecoration: 'none', color: 'var(--text-primary)' }}>Harga</a>
          {user ? (
            <Link to="/dashboard" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
          ) : (
            <>
              <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 'bold' }}>Masuk</Link>
              <Link to="/register" style={{ padding: '0.5rem 1rem', background: 'var(--primary)', color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontWeight: 'bold' }}>Daftar</Link>
            </>
          )}
        </nav>
      </header>

      {/* Main Content (Landing Page dll) */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ padding: '2rem', background: 'var(--text-primary)', color: 'var(--text-secondary)', textAlign: 'center' }}>
        <p>&copy; {new Date().getFullYear()} IK-Pro.My.Id. Undangan Digital Elegan Dalam Sekejap.</p>
      </footer>
    </div>
  );
}
