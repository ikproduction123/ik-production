import { createBrowserRouter } from 'react-router-dom';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { useAuth } from '../features/auth/AuthContext';

// Komponen sementara untuk Dashboard
const DashboardTemp = () => {
  const { user, role, logout } = useAuth();
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Dashboard Client</h1>
      <p>Selamat datang, {user.email} (Role: {role})</p>
      <button onClick={logout} style={{ padding: '0.5rem 1rem', marginTop: '1rem', cursor: 'pointer' }}>Logout</button>
    </div>
  );
};

export const router = createBrowserRouter([
  { path: "/", element: <div>Landing Page IK-Pro.My.Id (WIP)</div> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { 
    path: "/dashboard", 
    element: (
      <ProtectedRoute allowedRoles={['client']}>
        <DashboardTemp />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/admin", 
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <div>Dashboard Admin (WIP)</div>
      </ProtectedRoute>
    ) 
  },
  { path: "/:slug", element: <div>Halaman Undangan Publik (WIP)</div> },
]);
