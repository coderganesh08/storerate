import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, KeyRound, LayoutDashboard, LogOut, Store, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS } from '../utils/roles.js';

const NAV_ITEMS = {
  ADMIN: [
    { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/stores', label: 'Stores', icon: Store },
  ],
  USER: [{ to: '/stores', label: 'Stores', icon: Store }],
  STORE_OWNER: [{ to: '/owner', label: 'My stores', icon: Store }],
};

function pageTitle(pathname) {
  if (pathname === '/admin/users') return 'Users';
  if (pathname === '/admin/stores') return 'Stores';
  if (pathname.startsWith('/admin')) return 'Dashboard';
  if (pathname.startsWith('/stores')) return pathname === '/stores' ? 'Explore stores' : 'Store details';
  if (pathname.startsWith('/owner')) return 'My stores';
  if (pathname.startsWith('/account/password')) return 'Change password';
  return 'Workspace';
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  const linkClass = ({ isActive }) => (isActive ? 'nav-link nav-link-active' : 'nav-link');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark"><Store size={19} strokeWidth={1.8} aria-hidden="true" /></span>
          <span>StoreRate</span>
        </div>

        <p className="nav-caption">Workspace</p>

        <nav className="nav" aria-label="Main">
          {NAV_ITEMS[user.role].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
                <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <NavLink to="/account/password" className={linkClass}>
            <KeyRound size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Change password</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="current-user">
            <span className="user-avatar" aria-hidden="true">{initials(user.name)}</span>
            <span className="current-user-copy">
              <span className="current-user-name" title={user.name}>{user.name}</span>
              <span className="current-user-role">{ROLE_LABELS[user.role]}</span>
            </span>
          </div>
          <button type="button" className="logout-button" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="breadcrumbs" aria-label="Current page">
            <span>StoreRate</span>
            <ChevronRight size={14} aria-hidden="true" />
            <strong>{pageTitle(location.pathname)}</strong>
          </div>
          <div className="topbar-profile">
            <span className="topbar-avatar" aria-hidden="true">{initials(user.name)}</span>
            <span className="topbar-profile-copy">
              <strong>{user.name}</strong>
              <span>{ROLE_LABELS[user.role]}</span>
            </span>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
