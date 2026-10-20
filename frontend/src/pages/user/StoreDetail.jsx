import { useEffect, useState } from 'react';
import { ArrowLeft, Clock3, ExternalLink, MapPin, Phone, Store as StoreIcon } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import AverageRating from '../../components/AverageRating.jsx';
import Pagination from '../../components/Pagination.jsx';
import StarRating from '../../components/StarRating.jsx';
import { getErrorMessage } from '../../services/api.js';
import { getStore, rateStore } from '../../services/storeService.js';
import { formatDate } from '../../utils/format.js';

const PAGE_SIZE = 10;

export default function StoreDetail() {
  const { storeId } = useParams();
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState({ status: 'loading', data: null, error: '' });
  const [score, setScore] = useState(0);
  const [review, setReview] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let ignore = false;
    setState((current) => ({ ...current, status: 'loading', error: '' }));
    getStore(storeId, { page, pageSize: PAGE_SIZE })
      .then((data) => { if (!ignore) setState({ status: 'ready', data, error: '' }); })
      .catch((error) => { if (!ignore) setState({ status: 'error', data: null, error: getErrorMessage(error) }); });
    return () => { ignore = true; };
  }, [storeId, page, reloadKey]);

  const store = state.data?.store;
  useEffect(() => {
    if (!store) return;
    setScore(store.myRating ?? 0);
    setReview(store.myReview ?? '');
  }, [store?.id, store?.myRating, store?.myReview]);

  async function submitRating(event) {
    event.preventDefault();
    setSaveError('');
    setSuccess('');
    if (!score) {
      setSaveError('Choose a star rating before submitting.');
      return;
    }
    if (review.trim().length > 1000) {
      setSaveError('Review must be at most 1000 characters.');
      return;
    }

    setSaving(true);
    try {
      await rateStore(storeId, score, review.trim());
      setSuccess('Your rating and review have been saved.');
      setPage(1);
      setReloadKey((key) => key + 1);
    } catch (error) {
      setSaveError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const backState = location.state?.directoryQuery ? { state: { directoryQuery: location.state.directoryQuery } } : {};

  return (
    <div className="store-detail-page">
      <Link className="store-back-link" to="/stores" {...backState}>
        <ArrowLeft size={17} aria-hidden="true" /> Back to stores
      </Link>

      {state.status === 'loading' && <div className="store-list-message" role="status">Loading store details…</div>}
      {state.status === 'error' && (
        <div className="store-list-message store-list-error" role="alert">
          <p>{state.error}</p>
          <button type="button" className="btn btn-secondary btn-small" onClick={() => setReloadKey((key) => key + 1)}>Try again</button>
        </div>
      )}

      {store && (
        <>
          <section className="store-detail-hero" aria-labelledby="store-detail-title">
            <div className="store-detail-brandmark"><StoreIcon size={23} aria-hidden="true" /></div>
            <div className="store-detail-heading">
              <div className="store-row-title">
                <h1 id="store-detail-title">{store.name}</h1>
                {typeof store.isOpen === 'boolean' && (
                  <span className={store.isOpen ? 'store-open-status is-open' : 'store-open-status is-closed'}>
                    {store.isOpen ? 'Open' : 'Closed'}
                  </span>
                )}
              </div>
              <p className="store-detail-address"><MapPin size={16} aria-hidden="true" />{store.address}</p>
              <div className="store-detail-rating">
                <AverageRating value={store.averageRating} count={store.ratingCount} />
              </div>
            </div>
          </section>

          <div className="store-detail-grid">
            <section className="store-detail-panel" aria-labelledby="store-info-title">
              <h2 id="store-info-title">Store information</h2>
              <dl className="store-info-list">
                {store.category && <InfoRow label="Category">{store.category}</InfoRow>}
                {store.city && <InfoRow label="City / locality">{store.city}</InfoRow>}
                {store.state && <InfoRow label="State">{store.state}</InfoRow>}
                {store.postalCode && <InfoRow label="PIN code">{store.postalCode}</InfoRow>}
                {store.phone && <InfoRow label="Phone"><a href={`tel:${store.phone}`}><Phone size={14} aria-hidden="true" />{store.phone}</a></InfoRow>}
                {store.email && <InfoRow label="Contact email"><a href={`mailto:${store.email}`}>{store.email}</a></InfoRow>}
                {store.website && <InfoRow label="Website"><a href={store.website} target="_blank" rel="noreferrer">Visit website <ExternalLink size={13} aria-hidden="true" /></a></InfoRow>}
                {store.openingHours && <InfoRow label="Opening hours"><span className="info-with-icon"><Clock3 size={14} aria-hidden="true" />{store.openingHours}</span></InfoRow>}
                {store.description && <InfoRow label="About">{store.description}</InfoRow>}
                {!store.category && !store.city && !store.state && !store.postalCode && !store.phone && !store.email && !store.website && !store.openingHours && !store.description && (
                  <div className="store-info-row"><dt>Information</dt><dd className="muted store-info-empty">Additional store information has not been provided.</dd></div>
                )}
              </dl>
            </section>

            <section className="store-detail-panel rating-distribution-panel" aria-labelledby="distribution-title">
              <h2 id="distribution-title">Rating breakdown</h2>
              <p className="muted store-panel-caption">{store.ratingCount} customer rating{store.ratingCount === 1 ? '' : 's'}</p>
              <div className="rating-bars">
                {state.data.ratingDistribution.map(({ score: starScore, count }) => {
                  const percentage = store.ratingCount ? (count / store.ratingCount) * 100 : 0;
                  return (
                    <div className="rating-bar-row" key={starScore}>
                      <span>{starScore} ★</span>
                      <span className="rating-bar-track"><span style={{ width: `${percentage}%` }} /></span>
                      <span className="muted">{count}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="store-detail-panel store-review-section" aria-labelledby="reviews-title">
            <div className="section-header">
              <div>
                <h2 id="reviews-title">Customer reviews</h2>
                <p className="muted store-panel-caption">Ratings and comments shared by customers.</p>
              </div>
            </div>
            {state.data.reviews.length === 0 ? (
              <p className="store-reviews-empty muted">No customer ratings yet. You can be the first to rate this store.</p>
            ) : (
              <ul className="store-review-list">
                {state.data.reviews.map((item) => (
                  <li className="store-review" key={item.id}>
                    <div className="store-review-topline">
                      <strong>{item.reviewerName}</strong>
                      <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                    </div>
                    <p className="review-stars" aria-label={`${item.score} out of 5 stars`}>{'★'.repeat(item.score)}<span>{'★'.repeat(5 - item.score)}</span></p>
                    <p className="store-review-copy">{item.review || <span className="muted">No written review.</span>}</p>
                  </li>
                ))}
              </ul>
            )}
            <Pagination page={page} pageSize={PAGE_SIZE} total={state.data.pagination.total} onChange={setPage} />
          </section>

          <section className="store-detail-panel rate-store-panel" aria-labelledby="rate-store-title">
            <h2 id="rate-store-title">{store.myRating ? 'Update your rating' : 'Rate this store'}</h2>
            <p className="muted store-panel-caption">Your rating is visible with your display name.</p>
            <form onSubmit={submitRating} noValidate>
              <p className="rating-field-label">Your star rating</p>
              <StarRating value={score} onChange={(value) => { setScore(value); setSaveError(''); setSuccess(''); }} label={`Your rating for ${store.name}`} disabled={saving} />
              <label className="rating-field-label" htmlFor="store-review">Written review <span className="muted">(optional)</span></label>
              <textarea
                id="store-review"
                value={review}
                onChange={(event) => { setReview(event.target.value); setSaveError(''); setSuccess(''); }}
                maxLength={1000}
                rows={4}
                placeholder="Share a few details about your experience."
                disabled={saving}
                aria-describedby={saveError ? 'store-review-error' : 'store-review-count'}
                aria-invalid={saveError ? 'true' : undefined}
              />
              <div className="review-form-footer">
                <span className="muted" id="store-review-count">{review.length} / 1000</span>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : store.myRating ? 'Update rating' : 'Submit rating'}
                </button>
              </div>
              {saveError && <p className="field-error" id="store-review-error" role="alert">{saveError}</p>}
              {success && <p className="alert alert-success" role="status">{success}</p>}
            </form>
          </section>
        </>
      )}
    </div>
  );
}

function InfoRow({ label, children }) {
  return <div className="store-info-row"><dt>{label}</dt><dd>{children}</dd></div>;
}
