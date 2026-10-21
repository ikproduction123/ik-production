import { getCurrentUser } from '../config/supabase.js';

export async function protectPage(requiredRole = null) {
  const user = await getCurrentUser();

  if (!user) {
    window.location.href = '/login.html';
    return null;
  }

  if (requiredRole && user.profile?.role !== requiredRole) {
    if (user.profile?.role === 'admin') {
      window.location.href = '/dashboard/admin.html';
    } else {
      window.location.href = '/dashboard/index.html';
    }
    return null;
  }

  return user;
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();
  if (user) {
    if (user.profile?.role === 'admin') {
      window.location.href = '/dashboard/admin.html';
    } else {
      window.location.href = '/dashboard/index.html';
    }
  }
}
