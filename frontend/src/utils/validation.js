// Browser-side validation mirrors the API rules for immediate form feedback.

export function validateName(value) {
  const length = value.trim().length;
  if (length === 0) return 'Name is required';
  if (length < 2) return 'Name must be at least 2 characters';
  if (length > 60) return 'Name must be at most 60 characters';
  return '';
}

export function validateEmail(value) {
  const email = value.trim();
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return 'Enter a valid email address';
  return '';
}

export function validateAddress(value) {
  const address = value.trim();
  if (!address) return 'Address is required';
  if (address.length > 400) return 'Address must be at most 400 characters';
  return '';
}

export function validatePassword(value) {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (value.length > 16) return 'Password must be at most 16 characters';
  if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
  if (!/[^A-Za-z0-9\s]/.test(value)) return 'Password must contain at least one special character';
  return '';
}

export function validateRequired(label) {
  return (value) => (value ? '' : `${label} is required`);
}

const fieldValidators = {
  name: validateName,
  email: validateEmail,
  address: validateAddress,
  password: validatePassword,
  newPassword: validatePassword,
  currentPassword: validateRequired('Current password'),
};

export function validateField(name, value) {
  const validator = fieldValidators[name];
  return validator ? validator(value) : '';
}

// Returns { fieldName: message } for every listed field that is invalid. Empty object means valid.
export function validateFields(values, fieldNames) {
  const errors = {};
  for (const name of fieldNames) {
    const message = validateField(name, values[name] ?? '');
    if (message) errors[name] = message;
  }
  return errors;
}
