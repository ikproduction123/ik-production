import { createBrowserRouter } from 'react-router-dom';

export const router = createBrowserRouter([
  { path: "/", element: <div>Landing Page IK-Pro.My.Id (WIP)</div> },
  { path: "/login", element: <div>Login (WIP)</div> },
  { path: "/register", element: <div>Register (WIP)</div> },
  { path: "/dashboard", element: <div>Dashboard Client (WIP)</div> },
  { path: "/admin", element: <div>Dashboard Admin (WIP)</div> },
  { path: "/:slug", element: <div>Halaman Undangan Publik (WIP)</div> },
]);
