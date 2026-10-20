import { useEffect, useState } from 'react';
import { Star, Store, Users } from 'lucide-react';
import AverageRating from '../../components/AverageRating.jsx';
import MetricCard from '../../components/MetricCard.jsx';
import MobileSort from '../../components/MobileSort.jsx';
import Pagination from '../../components/Pagination.jsx';
import SortHeader from '../../components/SortHeader.jsx';
import TableMessageRow from '../../components/TableMessageRow.jsx';
import { getErrorMessage } from '../../services/api.js';
import { getRatings, getSummary } from '../../services/ownerService.js';
import { formatAverage, formatDate } from '../../utils/format.js';

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
  { key: 'date', label: 'Date' },
  { key: 'userName', label: 'User' },
  { key: 'storeName', label: 'Store' },
  { key: 'value', label: 'Rating' },
];

export default function OwnerDashboard() {
  const [summary, setSummary] = useState({ status: 'loading', data: null, error: '' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    setSummary({ status: 'loading', data: null, error: '' });
    getSummary()
      .then((data) => !ignore && setSummary({ status: 'ready', data, error: '' }))
      .catch((error) => !ignore && setSummary({ status: 'error', data: null, error: getErrorMessage(error) }));
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  return (
    <>
      <header className="page-header">
        <div>
          <h1>My stores</h1>
          <p className="muted">Track customer feedback and ratings across your stores.</p>
        </div>
      </header>

      {summary.status === 'loading' && <p className="muted">Loading…</p>}

      {summary.status === 'error' && (
        <div className="alert alert-error" role="alert">
          {summary.error}{' '}
          <button type="button" className="link-button" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </button>
        </div>
      )}

      {summary.status === 'ready' && summary.data.stores.length === 0 && (
        <div className="empty-block">
          <p>
            <strong>No store is assigned to your account yet.</strong>
          </p>
          <p className="muted">Ask an administrator to create your store and assign it to you.</p>
        </div>
      )}

      {summary.status === 'ready' && summary.data.stores.length > 0 && (
        <>
          <div className="metric-grid">
            <MetricCard
              icon={Star}
              label="Average rating"
              value={formatAverage(summary.data.overall.averageRating)}
              note="Across all your stores"
            />
            <MetricCard
              icon={Users}
              label="Total ratings"
              value={summary.data.overall.ratingCount}
              note="Submitted by customers"
            />
            <MetricCard icon={Store} label="Your stores" value={summary.data.stores.length} note="Assigned to your account" />
          </div>

          <section className="section">
            <h2>Your stores</h2>
            <div className="table-wrap">
              <table className="data-table responsive">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Address</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.data.stores.map((store) => (
                    <tr key={store.id}>
                      <td data-label="Store">
                        <strong>{store.name}</strong>
                      </td>
                      <td data-label="Address">{store.address}</td>
                      <td data-label="Rating">
                        <AverageRating value={store.averageRating} count={store.ratingCount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <RatingsTable stores={summary.data.stores} />
        </>
      )}
    </>
  );
}

// The users who rated this owner's stores, one row per rating.
function RatingsTable({ stores }) {
  const [query, setQuery] = useState({ storeId: '', sortBy: 'date', order: 'desc', page: 1 });
  const [state, setState] = useState({ status: 'loading', rows: [], total: 0, error: '' });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let ignore = false;
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    getRatings({ storeId: query.storeId, sortBy: query.sortBy, order: query.order, page: query.page, pageSize: PAGE_SIZE })
      .then((data) => {
        if (!ignore) setState({ status: 'ready', rows: data.ratings, total: data.pagination.total, error: '' });
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', rows: [], total: 0, error: getErrorMessage(error) });
      });
    return () => {
      ignore = true;
    };
  }, [query.storeId, query.sortBy, query.order, query.page, reloadKey]);

  const applySort = (sortBy, order) => setQuery((q) => ({ ...q, sortBy, order, page: 1 }));
  // Dates read best newest-first, so that column starts descending. Names and ratings start ascending.
  const toggleSort = (column) => {
    if (query.sortBy === column) applySort(column, query.order === 'asc' ? 'desc' : 'asc');
    else applySort(column, column === 'date' ? 'desc' : 'asc');
  };

  return (
    <section className="section">
      <div className="section-header">
        <h2>Who rated your stores</h2>
        {stores.length > 1 && (
          <select
            aria-label="Filter by store"
            value={query.storeId}
            onChange={(e) => setQuery((q) => ({ ...q, storeId: e.target.value, page: 1 }))}
          >
            <option value="">All stores</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <MobileSort options={SORT_OPTIONS} sortBy={query.sortBy} order={query.order} onChange={applySort} />

      <div className={state.status === 'loading' && state.rows.length > 0 ? 'table-wrap is-loading' : 'table-wrap'}>
        <table className="data-table responsive">
          <thead>
            <tr>
              <SortHeader label="User" column="userName" sortBy={query.sortBy} order={query.order} onSort={toggleSort} />
              <th>Email</th>
              <SortHeader label="Store" column="storeName" sortBy={query.sortBy} order={query.order} onSort={toggleSort} />
              <SortHeader label="Rating" column="value" sortBy={query.sortBy} order={query.order} onSort={toggleSort} />
              <SortHeader label="Rated on" column="date" sortBy={query.sortBy} order={query.order} onSort={toggleSort} />
            </tr>
          </thead>
          <tbody>
            {state.rows.length === 0 ? (
              <TableMessageRow
                colSpan={5}
                status={state.status}
                error={state.error}
                onRetry={reload}
                emptyTitle="Nobody has rated your store yet"
                emptyHint="Ratings will appear here as soon as users submit them."
              />
            ) : (
              state.rows.map((rating) => (
                <tr key={rating.id}>
                  <td data-label="User">
                    <strong>{rating.user.name}</strong>
                  </td>
                  <td data-label="Email">{rating.user.email}</td>
                  <td data-label="Store">{rating.store.name}</td>
                  <td data-label="Rating">
                    <span className="star-on">★</span> {rating.value} / 5
                  </td>
                  <td data-label="Rated on">{formatDate(rating.updatedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={query.page}
        pageSize={PAGE_SIZE}
        total={state.total}
        onChange={(page) => setQuery((q) => ({ ...q, page }))}
      />
    </section>
  );
}
