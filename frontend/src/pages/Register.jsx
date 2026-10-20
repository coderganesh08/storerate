import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { TextField } from '../components/FormFields.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import { homePathFor } from '../utils/roles.js';
import { validateField, validateFields } from '../utils/validation.js';

const FIELDS = ['name', 'email', 'address', 'password'];

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    // Once a field has shown an error, re-check it as the user types so the message clears as soon as it is fixed.
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
      const created = await register(values);
      navigate(homePathFor(created.role), { replace: true });
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form auth-form-wide" onSubmit={handleSubmit} noValidate>
        <div className="auth-brand">
          <span className="auth-brand-mark"><Store size={17} aria-hidden="true" /></span>
          <span>StoreRate</span>
        </div>
        <h1>Create an account</h1>
        <p className="muted">Sign up to browse stores and rate them.</p>

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
          autoComplete="name"
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
          autoComplete="email"
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
          autoComplete="street-address"
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

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
