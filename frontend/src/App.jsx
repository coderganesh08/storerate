import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import { RequireLogin, RequireRole } from './components/ProtectedRoute.jsx';
import { useAuth } from './context/AuthContext.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminStores from './pages/admin/AdminStores.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import OwnerDashboard from './pages/owner/OwnerDashboard.jsx';
import StoreDirectory from './pages/user/StoreDirectory.jsx';
import StoreDetail from './pages/user/StoreDetail.jsx';
import { homePathFor } from './utils/roles.js';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={homePathFor(user.role)} replace />;
}

function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-form">
        <h1>Page not found</h1>
        <p className="muted">That address does not exist.</p>
        <Link to="/">Go to the home page</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<RequireLogin />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/account/password" element={<ChangePassword />} />

          <Route element={<RequireRole roles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/stores" element={<AdminStores />} />
          </Route>

          <Route element={<RequireRole roles={['USER']} />}>
            <Route path="/stores" element={<StoreDirectory />} />
            <Route path="/stores/:storeId" element={<StoreDetail />} />
          </Route>

          <Route element={<RequireRole roles={['STORE_OWNER']} />}>
            <Route path="/owner" element={<OwnerDashboard />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
