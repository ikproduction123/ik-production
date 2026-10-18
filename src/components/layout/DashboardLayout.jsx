import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Home, Mail, PlusSquare, CreditCard, Settings, LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Undangan Saya', path: '/dashboard/invitations', icon: <Mail size={20} /> },
    { name: 'Buat Baru', path: '/dashboard/invitations/new', icon: <PlusSquare size={20} /> },
    { name: 'Transaksi', path: '/dashboard/transactions', icon: <CreditCard size={20} /> },
    { name: 'Pengaturan', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: isSidebarOpen ? '250px' : '0px', 
        backgroundColor: 'var(--surface)', 
        borderRight: '1px solid var(--border)',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ color: 'var(--warning)', margin: 0, fontSize: '1.5rem', whiteSpace: 'nowrap' }}>IK-Pro.My.Id</h2>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
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

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ backgroundColor: 'var(--surface)', padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
            <Menu size={24} />
          </button>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            Halo, <strong>{user?.user_metadata?.full_name || user?.email}</strong>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
