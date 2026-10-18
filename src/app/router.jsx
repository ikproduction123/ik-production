import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import LandingPage from '../pages/public/LandingPage';
import ThemesGallery from '../pages/public/ThemesGallery';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import Overview from '../pages/client/Overview';
import MyInvitations from '../pages/client/MyInvitations';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "themes", element: <ThemesGallery /> }
    ]
  },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { 
    path: "/dashboard", 
    element: (
      <ProtectedRoute allowedRoles={['client']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Overview /> },
      { path: "invitations", element: <MyInvitations /> },
      { path: "invitations/new", element: <div>Halaman Pilih Paket & Tema (WIP)</div> },
      { path: "transactions", element: <div>Halaman Transaksi (WIP)</div> },
      { path: "settings", element: <div>Pengaturan Profil (WIP)</div> },
    ]
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
