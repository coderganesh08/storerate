import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { TextField } from '../components/FormFields.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage, getFieldErrors } from '../services/api.js';
import { homePathFor } from '../utils/roles.js';
import { validateEmail } from '../utils/validation.js';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={homePathFor(user.role)} replace />;

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  }

  function checkEmail() {
    setErrors((e) => ({ ...e, email: validateEmail(values.email) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    // On login the password only needs to be present. Strength rules apply when it is created.
    const nextErrors = {
      email: validateEmail(values.email),
      password: values.password ? '' : 'Password is required',
    };
    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const signedIn = await login(values);
      navigate(homePathFor(signedIn.role), { replace: true });
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-brand">
          <span className="auth-brand-mark"><Store size={17} aria-hidden="true" /></span>
          <span>StoreRate</span>
        </div>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to continue to your account.</p>

        {formError && (
          <div className="alert alert-error" role="alert">
            {formError}
          </div>
        )}

        <TextField
          label="Email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          onBlur={checkEmail}
          error={errors.email}
          autoComplete="email"
          autoFocus
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
