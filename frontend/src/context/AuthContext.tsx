import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isLoggedIn: boolean;
  user: { name: string; email: string } | null;
  watchlist: string[];
  login: (name: string, email: string) => void;
  signup: (email: string, name: string) => void;
  isInWatchlist: (stockId: string) => boolean;
  addToWatchlist: (stockId: string, stockName?: string) => Promise<boolean>;
  removeFromWatchlist: (stockId: string) => void;
  toggleWatchlist: (stockId: string, stockName?: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // 기본 로그인 상태 (테스트용)
  const [user, setUser] = useState<{ name: string; email: string } | null>({
    name: '김상원',
    email: 'sangwon@moodon.com',
  });
  const [watchlist, setWatchlist] = useState<string[]>(['005930']);

  const login = (name: string, email: string) => {
    setIsLoggedIn(true);
    setUser({ name, email });
  };

  const signup = (email: string, name: string) => {
    setIsLoggedIn(true);
    setUser({ name, email });
  };

  const isInWatchlist = (stockId: string) => watchlist.includes(stockId);

  const addToWatchlist = async (stockId: string) => {
    if (watchlist.includes(stockId)) {
      return false;
    }
    setWatchlist((prev) => [...prev, stockId]);
    return true;
  };

  const removeFromWatchlist = (stockId: string) => {
    setWatchlist((prev) => prev.filter((id) => id !== stockId));
  };

  const toggleWatchlist = async (stockId: string) => {
    if (watchlist.includes(stockId)) {
      removeFromWatchlist(stockId);
      return false;
    }
    await addToWatchlist(stockId);
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, watchlist, login, signup, isInWatchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, logout }}>
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