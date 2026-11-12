import React, { createContext, useContext, useState } from 'react';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  watchlist: string[];
  login: (email: string, name?: string) => void;
  signup: (email: string, name: string) => void;
  updateUser: (name: string, email: string) => void;
  logout: () => void;
  isInWatchlist: (code: string) => boolean;
  addToWatchlist: (code: string) => void;
  removeFromWatchlist: (code: string) => void;
  toggleWatchlist: (code: string) => void;
}

const STORAGE_KEY = 'moodon_user';
const WATCHLIST_KEY = 'moodon_watchlist';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!localStorage.getItem(STORAGE_KEY);
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      return saved ? JSON.parse(saved) : ['005930'];
    } catch {
      return ['005930'];
    }
  });

  const login = (email: string, name?: string) => {
    const displayName = name || email.split('@')[0];
    const newUser = { email, name: displayName };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const signup = (email: string, name: string) => {
    const newUser = { email, name };
    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
  };

  const updateUser = (name: string, email: string) => {
    const updated = { name, email };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(WATCHLIST_KEY);
  };

  const isInWatchlist = (code: string) => watchlist.includes(code);

  const addToWatchlist = (code: string) => {
    if (!watchlist.includes(code)) {
      const updated = [...watchlist, code];
      setWatchlist(updated);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
    }
  };

  const removeFromWatchlist = (code: string) => {
    const updated = watchlist.filter((c) => c !== code);
    setWatchlist(updated);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  };

  const toggleWatchlist = (code: string) => {
    if (watchlist.includes(code)) {
      removeFromWatchlist(code);
    } else {
      addToWatchlist(code);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        watchlist,
        login,
        signup,
        updateUser,
        logout,
        isInWatchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
