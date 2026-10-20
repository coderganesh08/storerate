import { createContext, useEffect, useState, useContext } from 'react';
import { TOKEN_KEY } from '../services/api.js';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService.getCurrentUser().then(setUser).catch(() => localStorage.removeItem(TOKEN_KEY)).finally(() => setLoading(false));
  }, []);

  function startSession({ token, user: signedInUser }) {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(signedInUser);
    return signedInUser;
  }

  const login = async (credentials) => startSession(await authService.login(credentials));
  const register = async (details) => startSession(await authService.signup(details));

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
