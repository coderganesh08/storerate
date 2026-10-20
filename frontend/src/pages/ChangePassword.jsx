import { useState } from 'react';
import { TextField } from '../components/FormFields.jsx';
import { changePassword } from '../services/authService.js';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import { validateField, validateFields } from '../utils/validation.js';

const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

// Available to every signed-in role.
export default function ChangePassword() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function checkField(name, value, all = values) {
    if (name === 'confirmPassword') {
      return value === all.newPassword ? '' : 'Passwords do not match';
    }
    return validateField(name, value);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setSuccess(false);
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: checkField(name, value, { ...values, [name]: value }) }));
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    setErrors((e) => ({ ...e, [name]: checkField(name, value) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setSuccess(false);

    const nextErrors = validateFields(values, ['currentPassword', 'newPassword']);
    const mismatch = checkField('confirmPassword', values.confirmPassword);
    if (mismatch) nextErrors.confirmPassword = mismatch;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
      setValues(EMPTY);
      setErrors({});
      setSuccess(true);
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <h1>Change password</h1>
          <p className="muted">Enter your current password, then choose a new one.</p>
        </div>
      </header>

      <form className="form-panel" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        )}
        {success && (
          <div className="alert alert-success" role="status">
            Your password has been updated.
          </div>
        )}

        <TextField
          label="Current password"
          name="currentPassword"
          type="password"
          value={values.currentPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.currentPassword}
          autoComplete="current-password"
        />
        <TextField
          label="New password"
          name="newPassword"
          type="password"
          value={values.newPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.newPassword}
          hint="8 to 16 characters, with at least one uppercase letter and one special character"
          autoComplete="new-password"
        />
        <TextField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Update password'}
          </button>
        </div>
      </form>
    </>
  );
}
