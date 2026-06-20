import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sf_user');
    return saved ? JSON.parse(saved) : null;
  });

  function login(username) {
    const userData = { id: `user_${username.toLowerCase().replace(/\s+/g, '_')}`, username };
    localStorage.setItem('sf_user', JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('sf_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
