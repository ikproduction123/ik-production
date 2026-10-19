import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import ProtectedRoute from './features/auth/ProtectedRoute';

// Import Halaman Auth & Dashboard
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layout/DashboardLayout';
import Overview from './pages/client/Overview';
import Invitations from './pages/client/Invitations';
import Editor from './pages/client/Editor';

// IMPORT HALAMAN UNDANGAN PUBLIK YANG BARU DIBUAT
import InvitationView from './pages/public/InvitationView';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Halaman Autentikasi */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Halaman Dashboard Klien (Dilindungi) */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Overview />} />
            <Route path="invitations" element={<Invitations />} />
            <Route path="invitations/:id" element={<Editor />} />
          </Route>

          {/* Redirect halaman utama (root) ke login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* HALAMAN UNDANGAN PUBLIK (Selalu letakkan di paling bawah) */}
          <Route path="/:slug" element={<InvitationView />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
