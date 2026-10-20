import { useEffect, useState } from 'react';
import { SelectField, TextField } from '../../components/FormFields.jsx';
import Modal from '../../components/Modal.jsx';
import { createStore, getOwners } from '../../services/adminService.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { validateField, validateFields } from '../../utils/validation.js';

const FIELDS = ['name', 'email', 'address'];

export default function StoreFormModal({ open, onClose, onCreated }) {
  return (
    <Modal open={open} title="Add store" onClose={onClose}>
      <StoreForm onClose={onClose} onCreated={onCreated} />
    </Modal>
  );
}

function StoreForm({ onClose, onCreated }) {
  const [values, setValues] = useState({
    name: '', email: '', address: '', ownerId: '', category: '', city: '', state: '', postalCode: '',
    phone: '', website: '', description: '', openingHours: '', isOpen: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [owners, setOwners] = useState({ status: 'loading', list: [] });

  // A store has to belong to a store owner, so load the available owners for the dropdown.
  useEffect(() => {
    let ignore = false;
    getOwners()
      .then((list) => !ignore && setOwners({ status: 'ready', list }))
      .catch(() => !ignore && setOwners({ status: 'error', list: [] }));
    return () => {
      ignore = true;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: name === 'ownerId' ? '' : validateField(name, value) }));
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    if (name !== 'ownerId') setErrors((e) => ({ ...e, [name]: validateField(name, value) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const nextErrors = validateFields(values, FIELDS);
    if (!values.ownerId) nextErrors.ownerId = 'Choose a store owner';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createStore({ ...values, ownerId: Number(values.ownerId) });
      onCreated();
      onClose();
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  const noOwners = owners.status === 'ready' && owners.list.length === 0;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="alert alert-error" role="alert">
          {formError}
        </div>
      )}

      <TextField
        label="Store name"
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.name}
        hint="2 to 60 characters"
        autoFocus
      />
      <TextField
        label="Store email"
        name="email"
        type="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
      />
      <TextField
        label="Address"
        name="address"
        value={values.address}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.address}
        hint={`${values.address.length} / 400 characters`}
        multiline
      />
      <TextField label="Category" name="category" value={values.category} onChange={handleChange} maxLength={80} />
      <TextField label="City / locality" name="city" value={values.city} onChange={handleChange} maxLength={100} />
      <TextField label="State" name="state" value={values.state} onChange={handleChange} maxLength={100} />
      <TextField label="PIN code" name="postalCode" value={values.postalCode} onChange={handleChange} maxLength={20} />
      <TextField label="Phone" name="phone" type="tel" value={values.phone} onChange={handleChange} maxLength={32} />
      <TextField label="Website" name="website" type="url" value={values.website} onChange={handleChange} maxLength={2048} />
      <TextField label="Description" name="description" value={values.description} onChange={handleChange} maxLength={2000} multiline />
      <TextField label="Opening hours" name="openingHours" value={values.openingHours} onChange={handleChange} maxLength={1000} multiline />
      <SelectField label="Current status" name="isOpen" value={values.isOpen} onChange={handleChange}>
        <option value="">Unknown</option>
        <option value="true">Open</option>
        <option value="false">Closed</option>
      </SelectField>
      <SelectField
        label="Store owner"
        name="ownerId"
        value={values.ownerId}
        onChange={handleChange}
        error={errors.ownerId}
        hint={
          noOwners
            ? 'There are no store owner accounts yet. Create one from the Users page first.'
            : owners.status === 'error'
              ? 'Could not load store owners. Close this window and try again.'
              : undefined
        }
      >
        <option value="">{owners.status === 'loading' ? 'Loading owners…' : 'Select an owner'}</option>
        {owners.list.map((owner) => (
          <option key={owner.id} value={owner.id}>
            {owner.name} ({owner.email})
          </option>
        ))}
      </SelectField>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting || noOwners}>
          {submitting ? 'Creating…' : 'Create store'}
        </button>
      </div>
    </form>
  );
}
