import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Store, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import MetricCard from '../../components/MetricCard.jsx';
import { getStats } from '../../services/adminService.js';
import { getErrorMessage } from '../../services/api.js';

export default function AdminDashboard() {
  const [state, setState] = useState({ status: 'loading', stats: null, error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState({ status: 'loading', stats: null, error: '' });
    getStats()
      .then((stats) => !ignore && setState({ status: 'ready', stats, error: '' }))
      .catch((error) => !ignore && setState({ status: 'error', stats: null, error: getErrorMessage(error) }));
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const { status, stats, error } = state;

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="muted">A clear view of your stores, users, and customer feedback.</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/users" className="btn btn-secondary">
            Manage users
          </Link>
          <Link to="/admin/stores" className="btn btn-secondary">
            Manage stores
          </Link>
        </div>
      </header>

      {status === 'loading' && <p className="muted">Loading…</p>}

      {status === 'error' && (
        <div className="alert alert-error" role="alert">
          {error}{' '}
          <button type="button" className="link-button" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="metric-grid">
            <MetricCard
              icon={Users}
              label="Total users"
              value={stats.users}
              note={`${stats.usersByRole.ADMIN} admins · ${stats.usersByRole.USER} users · ${stats.usersByRole.STORE_OWNER} owners`}
            />
            <MetricCard icon={Store} label="Total stores" value={stats.stores} note="Registered on the platform" />
            <MetricCard icon={Star} label="Total ratings" value={stats.ratings} note="Submitted by your community" />
          </div>

          <section className="section">
            <h2>Ratings by score</h2>
            {stats.ratings === 0 ? (
              <p className="muted">No ratings have been submitted yet. The chart appears once users start rating stores.</p>
            ) : (
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.distribution} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid vertical={false} stroke="#E3E8E0" />
                    <XAxis dataKey="score" tickFormatter={(score) => `${score} ★`} tickLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                      formatter={(count) => [count, 'Ratings']}
                      labelFormatter={(score) => `${score} star${score === 1 ? '' : 's'}`}
                    />
                    <Bar dataKey="count" fill="#52745C" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
