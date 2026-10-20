import { useEffect, useState } from 'react';
import AverageRating from '../../components/AverageRating.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import MobileSort from '../../components/MobileSort.jsx';
import Pagination from '../../components/Pagination.jsx';
import SortHeader from '../../components/SortHeader.jsx';
import TableMessageRow from '../../components/TableMessageRow.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import { deleteUser, getUsers } from '../../services/adminService.js';
import { getErrorMessage } from '../../services/api.js';
import { ROLE_LABELS } from '../../utils/roles.js';
import UserFormModal from './UserFormModal.jsx';

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Address' },
  { key: 'role', label: 'Role' },
  { key: 'rating', label: 'Rating' },
];

export default function AdminUsers() {
  const { user: currentUser } = useAuth();

  const [query, setQuery] = useState({ search: '', role: '', sortBy: 'name', order: 'asc', page: 1 });
  const debouncedSearch = useDebounce(query.search, 300);

  const [state, setState] = useState({ status: 'loading', rows: [], total: 0, error: '' });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  const [showCreate, setShowCreate] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let ignore = false;
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    getUsers({
      search: debouncedSearch,
      role: query.role,
      sortBy: query.sortBy,
      order: query.order,
      page: query.page,
      pageSize: PAGE_SIZE,
    })
      .then((data) => {
        if (!ignore) setState({ status: 'ready', rows: data.users, total: data.pagination.total, error: '' });
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', rows: [], total: 0, error: getErrorMessage(error) });
      });
    return () => {
      ignore = true;
    };
  }, [debouncedSearch, query.role, query.sortBy, query.order, query.page, reloadKey]);

  const applySort = (sortBy, order) => setQuery((q) => ({ ...q, sortBy, order, page: 1 }));
  const toggleSort = (column) => applySort(column, query.sortBy === column && query.order === 'asc' ? 'desc' : 'asc');

  async function confirmDelete() {
    setDeleting(true);
    setActionError('');
    try {
      await deleteUser(toDelete.id);
      setToDelete(null);
      // Deleting the last row of a page would leave an empty page, so step back one.
      if (state.rows.length === 1 && query.page > 1) setQuery((q) => ({ ...q, page: q.page - 1 }));
      else reload();
    } catch (error) {
      setToDelete(null);
      setActionError(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = query.search !== '' || query.role !== '';

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Users</h1>
          <p className="muted">Everyone who can sign in: administrators, normal users and store owners.</p>
        </div>
        <div className="page-actions">
          <button type="button" className="btn btn-primary" onClick={() => setShowCreate(true)}>
            Add user
          </button>
        </div>
      </header>

      {actionError && (
        <div className="alert alert-error" role="alert">
          {actionError}
        </div>
      )}

      <div className="toolbar">
        <input
          type="search"
          className="toolbar-search"
          placeholder="Search name, email or address"
          aria-label="Search users"
          value={query.search}
          onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))}
        />
        <select
          aria-label="Filter by role"
          value={query.role}
          onChange={(e) => setQuery((q) => ({ ...q, role: e.target.value, page: 1 }))}
        >
          <option value="">All roles</option>
          <option value="ADMIN">Administrators</option>
          <option value="USER">Users</option>
          <option value="STORE_OWNER">Store owners</option>
        </select>
        <MobileSort options={SORT_OPTIONS} sortBy={query.sortBy} order={query.order} onChange={applySort} />
      </div>

      <div className={state.status === 'loading' && state.rows.length > 0 ? 'table-wrap is-loading' : 'table-wrap'}>
        <table className="data-table responsive">
          <thead>
            <tr>
              <SortHeader label="Name" column="name" sortBy={query.sortBy} order={query.order} onSort={toggleSort} />
              <SortHeader label="Email" column="email" sortBy={query.sortBy} order={query.order} onSort={toggleSort} />
              <SortHeader label="Address" column="address" sortBy={query.sortBy} order={query.order} onSort={toggleSort} />
              <SortHeader label="Role" column="role" sortBy={query.sortBy} order={query.order} onSort={toggleSort} />
              <SortHeader label="Rating" column="rating" sortBy={query.sortBy} order={query.order} onSort={toggleSort} />
              <th className="col-actions">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {state.rows.length === 0 ? (
              <TableMessageRow
                colSpan={6}
                status={state.status}
                error={state.error}
                onRetry={reload}
                emptyTitle={hasFilters ? 'No users match your search' : 'No users yet'}
                emptyHint={hasFilters ? 'Try a different search term or clear the role filter.' : 'Use "Add user" to create one.'}
              />
            ) : (
              state.rows.map((row) => (
                <tr key={row.id}>
                  <td data-label="Name">
                    <strong>{row.name}</strong>
                  </td>
                  <td data-label="Email">{row.email}</td>
                  <td data-label="Address">{row.address}</td>
                  <td data-label="Role">
                    <span className="badge">{ROLE_LABELS[row.role]}</span>
                  </td>
                  <td data-label="Rating">
                    {row.role === 'STORE_OWNER' ? (
                      <AverageRating value={row.rating} />
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td data-label="Actions" className="col-actions">
                    <button
                      type="button"
                      className="btn btn-danger-outline btn-small"
                      onClick={() => setToDelete(row)}
                      disabled={row.id === currentUser.id}
                      title={row.id === currentUser.id ? 'You cannot delete your own account' : undefined}
                    >
                      Delete
                    </button>
                  </td>
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

      <UserFormModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={reload} />

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete user"
        message={
          toDelete
            ? `Delete ${toDelete.name}? Their account and every rating they have submitted will be removed. This cannot be undone.`
            : ''
        }
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
