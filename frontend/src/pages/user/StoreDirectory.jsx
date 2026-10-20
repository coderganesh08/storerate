import { useEffect, useState } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AverageRating from '../../components/AverageRating.jsx';
import MobileSort from '../../components/MobileSort.jsx';
import Pagination from '../../components/Pagination.jsx';
import useDebounce from '../../hooks/useDebounce.js';
import { getErrorMessage } from '../../services/api.js';
import { getStores } from '../../services/storeService.js';

const PAGE_SIZE = 10;
const SORT_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Address' },
  { key: 'averageRating', label: 'Overall rating' },
];

export default function StoreDirectory() {
  const location = useLocation();
  const [query, setQuery] = useState(() => location.state?.directoryQuery || { search: '', sortBy: 'name', order: 'asc', page: 1 });
  const debouncedSearch = useDebounce(query.search, 300);

  const [state, setState] = useState({ status: 'loading', rows: [], total: 0, error: '' });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let ignore = false;
    setState((s) => ({ ...s, status: 'loading', error: '' }));
    getStores({ search: debouncedSearch, sortBy: query.sortBy, order: query.order, page: query.page, pageSize: PAGE_SIZE })
      .then((data) => {
        if (!ignore) setState({ status: 'ready', rows: data.stores, total: data.pagination.total, error: '' });
      })
      .catch((error) => {
        if (!ignore) setState({ status: 'error', rows: [], total: 0, error: getErrorMessage(error) });
      });
    return () => {
      ignore = true;
    };
  }, [debouncedSearch, query.sortBy, query.order, query.page, reloadKey]);

  const applySort = (sortBy, order) => setQuery((q) => ({ ...q, sortBy, order, page: 1 }));

  const hasSearch = query.search !== '';

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Explore Stores</h1>
          <p className="muted">Discover registered stores, see what customers think, and share your own rating.</p>
        </div>
      </header>

      <div className="toolbar">
        <input
          type="search"
          className="toolbar-search"
          placeholder="Search by store name or address"
          aria-label="Search stores"
          value={query.search}
          onChange={(e) => setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))}
        />
        <div className="directory-sort">
          <label className="sr-only" htmlFor="directory-sort-select">Sort stores by</label>
          <select id="directory-sort-select" value={query.sortBy} onChange={(event) => applySort(event.target.value, query.order)}>
            {SORT_OPTIONS.map((option) => <option key={option.key} value={option.key}>Sort: {option.label}</option>)}
          </select>
          <button type="button" className="btn btn-secondary" onClick={() => applySort(query.sortBy, query.order === 'asc' ? 'desc' : 'asc')} aria-label={query.order === 'asc' ? 'Ascending, switch to descending' : 'Descending, switch to ascending'}>
            {query.order === 'asc' ? '▲ Asc' : '▼ Desc'}
          </button>
        </div>
        <MobileSort options={SORT_OPTIONS} sortBy={query.sortBy} order={query.order} onChange={applySort} />
      </div>

      {state.status === 'loading' && <div className="store-list-message" role="status">Loading stores…</div>}
      {state.status === 'error' && (
        <div className="store-list-message store-list-error" role="alert">
          <p>{state.error}</p>
          <button type="button" className="btn btn-secondary btn-small" onClick={reload}>Try again</button>
        </div>
      )}
      {state.status === 'ready' && state.rows.length === 0 && (
        <div className="store-list-message">
          <strong>{hasSearch ? `No stores match “${query.search}”` : 'No stores are listed yet'}</strong>
          <p>{hasSearch ? 'Check the spelling or try part of the name or address.' : 'Check back once an administrator has added some.'}</p>
        </div>
      )}
      {state.status === 'ready' && state.rows.length > 0 && (
        <ul className="store-list" aria-label="Stores">
          {state.rows.map((store) => {
            const locality = [store.city, store.state, store.postalCode].filter(Boolean).join(', ');
            const locationText = locality || store.address;
            return (
              <li key={store.id}>
                <Link className="store-row" to={`/stores/${store.id}`} state={{ directoryQuery: query }}>
                  <span className="store-row-copy">
                    <span className="store-row-title">
                      <strong>{store.name}</strong>
                      {store.category && <span className="badge">{store.category}</span>}
                      {typeof store.isOpen === 'boolean' && (
                        <span className={store.isOpen ? 'store-open-status is-open' : 'store-open-status is-closed'}>
                          {store.isOpen ? 'Open' : 'Closed'}
                        </span>
                      )}
                    </span>
                    <span className="store-row-meta">
                      <span><MapPin size={14} aria-hidden="true" />{locationText}</span>
                      {store.openingHours && <span>{store.openingHours}</span>}
                    </span>
                  </span>
                  <span className="store-row-rating">
                    <AverageRating value={store.averageRating} count={store.ratingCount} />
                  </span>
                  <ChevronRight className="store-row-chevron" size={19} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Pagination
        page={query.page}
        pageSize={PAGE_SIZE}
        total={state.total}
        onChange={(page) => setQuery((q) => ({ ...q, page }))}
      />
    </>
  );
}
