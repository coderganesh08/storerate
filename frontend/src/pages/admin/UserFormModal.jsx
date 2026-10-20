import { useState } from 'react';
import { SelectField, TextField } from '../../components/FormFields.jsx';
import Modal from '../../components/Modal.jsx';
import { createUser } from '../../services/adminService.js';
import { getErrorMessage, getFieldErrors } from '../../services/api.js';
import { validateField, validateFields } from '../../utils/validation.js';

const FIELDS = ['name', 'email', 'address', 'password'];

export default function UserFormModal({ open, onClose, onCreated }) {
  return (
    <Modal open={open} title="Add user" onClose={onClose}>
      <UserForm onClose={onClose} onCreated={onCreated} />
    </Modal>
  );
}

// Lives inside the modal, so its state is thrown away every time the modal closes.
function UserForm({ onClose, onCreated }) {
  const [values, setValues] = useState({ name: '', email: '', address: '', password: '', role: 'USER' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: validateField(name, value) }));
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    setErrors((e) => ({ ...e, [name]: validateField(name, value) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const nextErrors = validateFields(values, FIELDS);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await createUser(values);
      onCreated();
      onClose();
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className="alert alert-error" role="alert">
          {formError}
        </div>
      )}

      <TextField
        label="Full name"
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.name}
        hint="2 to 60 characters"
        autoFocus
      />
      <TextField
        label="Email"
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
      <TextField
        label="Password"
        name="password"
        type="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.password}
        hint="8 to 16 characters, with at least one uppercase letter and one special character"
        autoComplete="new-password"
      />
      <SelectField
        label="Role"
        name="role"
        value={values.role}
        onChange={handleChange}
        error={errors.role}
        hint="Store owners can be assigned to a store after they are created."
      >
        <option value="USER">User</option>
        <option value="STORE_OWNER">Store owner</option>
        <option value="ADMIN">Administrator</option>
      </SelectField>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create user'}
        </button>
      </div>
    </form>
  );
}
