import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Home, Mail, PlusSquare, CreditCard, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Deteksi ukuran layar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
        setIsSidebarOpen(false); // Tutup sidebar secara default di HP
      } else {
        setIsMobile(false);
        setIsSidebarOpen(true); // Buka sidebar secara default di Desktop
      }
    };

    // Jalankan sekali saat komponen dimuat
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Tutup sidebar otomatis di HP setelah mengklik menu
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Undangan Saya', path: '/dashboard/invitations', icon: <Mail size={20} /> },
    { name: 'Buat Baru', path: '/dashboard/invitations/new', icon: <PlusSquare size={20} /> },
    { name: 'Transaksi', path: '/dashboard/transactions', icon: <CreditCard size={20} /> },
    { name: 'Pengaturan', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
      
      {/* Backdrop Gelap untuk Mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40,
            transition: 'opacity 0.3s'
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{ 
        width: isSidebarOpen ? '250px' : '0px', 
        backgroundColor: 'var(--surface)', 
        borderRight: '1px solid var(--border)',
        transition: 'width 0.3s ease, transform 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'relative',
        top: 0, bottom: 0, left: 0,
        zIndex: 50,
        height: '100vh',
        whiteSpace: 'nowrap',
        boxShadow: isMobile && isSidebarOpen ? '4px 0 10px rgba(0,0,0,0.1)' : 'none'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--warning)', margin: 0, fontSize: '1.5rem' }}>IK-Pro</h2>
          {isMobile && (
            <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex' }}>
              <X size={24} />
            </button>
          )}
        </div>
        
        <nav style={{ flex: 1, padding: '1rem 0', overflowY: 'auto' }}>
          {navItems.map((item) => {
            // Tandai menu aktif (termasuk sub-route)
            const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem 1.5rem',
                  textDecoration: 'none', color: isActive ? 'var(--warning)' : 'var(--text-primary)',
                  backgroundColor: isActive ? 'var(--bg-primary)' : 'transparent',
                  borderRight: isActive ? '3px solid var(--warning)' : 'none',
                  fontWeight: isActive ? 'bold' : 'normal'
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem' }}>
          <button 
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', padding: '0.8rem', backgroundColor: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 'bold' }}
          >
            <LogOut size={20} />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '100vw' }}>
        {/* Topbar */}
        <header style={{ backgroundColor: 'var(--surface)', padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
            <Menu size={24} />
          </button>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Sembunyikan kata "Halo" di layar HP agar lebih rapi */}
            <span style={{ display: isMobile ? 'none' : 'inline' }}>Halo,</span> 
            <strong>{user?.user_metadata?.full_name || user?.email}</strong>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: isMobile ? '1rem' : '2rem', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
