import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/stock';

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  watchlist: string[]; // Stock IDs
  addToWatchlist: (stockId: string) => void;
  removeFromWatchlist: (stockId: string) => void;
  toggleWatchlist: (stockId: string) => boolean; // returns new isWatched status
  isInWatchlist: (stockId: string) => boolean;
  login: (email: string, name?: string) => void;
  signup: (email: string, name: string) => void;
  logout: () => void;
  quickDemoLogin: () => void;
}

const DEFAULT_GUEST_WATCHLIST = ['005930', '000660', '196170', '012450'];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('toss_stock_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const savedUser = localStorage.getItem('toss_stock_user');
      const userId = savedUser ? JSON.parse(savedUser).id : 'guest';
      const savedList = localStorage.getItem(`toss_stock_watchlist_${userId}`);
      return savedList ? JSON.parse(savedList) : DEFAULT_GUEST_WATCHLIST;
    } catch {
      return DEFAULT_GUEST_WATCHLIST;
    }
  });

  // Whenever user changes, load that user's watchlist
  useEffect(() => {
    try {
      const userId = currentUser ? currentUser.id : 'guest';
      const savedList = localStorage.getItem(`toss_stock_watchlist_${userId}`);
      if (savedList) {
        setWatchlist(JSON.parse(savedList));
      } else {
        const initial = currentUser?.watchlist || DEFAULT_GUEST_WATCHLIST;
        setWatchlist(initial);
        localStorage.setItem(`toss_stock_watchlist_${userId}`, JSON.stringify(initial));
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentUser]);

  // Persist watchlist changes
  const saveWatchlist = (newList: string[]) => {
    setWatchlist(newList);
    const userId = currentUser ? currentUser.id : 'guest';
    try {
      localStorage.setItem(`toss_stock_watchlist_${userId}`, JSON.stringify(newList));
      if (currentUser) {
        const updatedUser = { ...currentUser, watchlist: newList };
        setCurrentUser(updatedUser);
        localStorage.setItem('toss_stock_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isInWatchlist = (stockId: string) => {
    return watchlist.includes(stockId);
  };

  const addToWatchlist = (stockId: string) => {
    if (!watchlist.includes(stockId)) {
      saveWatchlist([...watchlist, stockId]);
    }
  };

  const removeFromWatchlist = (stockId: string) => {
    saveWatchlist(watchlist.filter(id => id !== stockId));
  };

  const toggleWatchlist = (stockId: string): boolean => {
    if (watchlist.includes(stockId)) {
      removeFromWatchlist(stockId);
      return false;
    } else {
      addToWatchlist(stockId);
      return true;
    }
  };

  const login = (email: string, name?: string) => {
    const user: User = {
      id: `usr_${email.replace(/[^a-zA-Z0-9]/g, '') || 'demo'}`,
      email,
      name: name || (email.split('@')[0] + ' 님'),
      watchlist: DEFAULT_GUEST_WATCHLIST,
      joinedDate: '2026.10'
    };
    setCurrentUser(user);
    localStorage.setItem('toss_stock_user', JSON.stringify(user));
  };

  const signup = (email: string, name: string) => {
    const user: User = {
      id: `usr_${Date.now()}`,
      email,
      name: name || '투자자 님',
      watchlist: ['005930', '000660', '003230'],
      joinedDate: '2026.10'
    };
    setCurrentUser(user);
    localStorage.setItem('toss_stock_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('toss_stock_user');
  };

  const quickDemoLogin = () => {
    login('investor@toss.im', '김토스');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        toggleWatchlist,
        isInWatchlist,
        login,
        signup,
        logout,
        quickDemoLogin
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
