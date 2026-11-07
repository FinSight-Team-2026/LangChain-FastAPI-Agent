import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User } from '../types/stock';

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  watchlist: string[];
  addToWatchlist: (stockId: string, stockName?: string) => Promise<void>;
  removeFromWatchlist: (stockId: string, stockName?: string) => Promise<void>;
  toggleWatchlist: (stockId: string, stockName?: string) => Promise<boolean>;
  isInWatchlist: (stockId: string) => boolean;
  login: (email: string, name?: string) => void;
  signup: (email: string, name: string) => void;
  updateProfile: (name: string, email: string) => void;
  deleteAccount: () => void;
  logout: () => void;
}

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

  const [watchlist, setWatchlist] = useState<string[]>([]);

  // 로그인된 유저의 email(username)을 기준으로 백엔드에서 즐겨찾기 목록 조회
  useEffect(() => {
    let isMounted = true;

    const fetchFavorites = async () => {
      if (currentUser && currentUser.email) {
        const username = currentUser.email.trim();

        try {
          // 백엔드 컨트롤러가 email/username을 인식할 수 있도록 전달
          const response = await axios.get(`/api/favorites`, {
            params: { userId: username, user_id: username, username: username }
          });
          if (isMounted) {
            const serverWatchlist = (response.data || []).map((fav: any) => 
              String(fav.stockCode || fav.stock_code || fav.code || '').trim()
            );
            setWatchlist(serverWatchlist);
          }
        } catch (e) {
          if (isMounted) {
            console.error('관심 종목을 불러오지 못했습니다.', e);
            setWatchlist([]);
          }
        }
      } else {
        if (isMounted) {
          setWatchlist([]);
        }
      }
    };

    fetchFavorites();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.email]);

  const isInWatchlist = (stockId: string) => {
    const target = String(stockId || '').trim();
    return watchlist.some(id => String(id).trim() === target);
  };

  const addToWatchlist = async (stockId: string, stockName: string = '주식종목') => {
    const cleanId = String(stockId || '').trim();
    if (!isInWatchlist(cleanId)) {
      const newList = [...watchlist, cleanId];
      setWatchlist(newList);

      if (currentUser && currentUser.email) {
        try {
          const username = currentUser.email.trim();
          await axios.post('/api/favorites', {
            userId: username,
            user_id: username,
            username: username,
            stockCode: cleanId,
            stock_code: cleanId,
            stockName: stockName,
            stock_name: stockName
          });
        } catch (e) {
          console.error('백엔드 관심 종목 저장 실패', e);
        }
      }
    }
  };

  const removeFromWatchlist = async (stockId: string) => {
    const cleanId = String(stockId || '').trim();
    const newList = watchlist.filter(id => String(id).trim() !== cleanId);
    setWatchlist(newList);

    if (currentUser && currentUser.email) {
      try {
        const username = currentUser.email.trim();
        await axios.delete(`/api/favorites/${cleanId}`, {
          params: {
            userId: username,
            user_id: username,
            username: username
          }
        });
      } catch (e) {
        console.error('백엔드 관심 종목 삭제 실패', e);
      }
    }
  };

  const toggleWatchlist = async (stockId: string, stockName: string = '주식종목'): Promise<boolean> => {
    const cleanId = String(stockId || '').trim();
    if (isInWatchlist(cleanId)) {
      await removeFromWatchlist(cleanId);
      return false;
    } else {
      await addToWatchlist(cleanId, stockName);
      return true;
    }
  };

  const login = (email: string, name?: string) => {
    localStorage.removeItem('toss_stock_user');
    
    const user: User = {
      id: email, // 고유 식별자로 email 사용
      email,
      name: name || (email.split('@')[0] + ' 님'),
      watchlist: [],
      joinedDate: '2026.11'
    };
    
    setWatchlist([]);
    setCurrentUser(user);
    localStorage.setItem('toss_stock_user', JSON.stringify(user));
  };

  const signup = (email: string, name: string) => {
    localStorage.removeItem('toss_stock_user');

    const user: User = {
      id: email, // 고유 식별자로 email 사용
      email,
      name: name || '투자자 님',
      watchlist: [],
      joinedDate: '2026.11'
    };
    
    setWatchlist([]);
    setCurrentUser(user);
    localStorage.setItem('toss_stock_user', JSON.stringify(user));
  };

  const updateProfile = (name: string, email: string) => {
    if (!currentUser) {
      throw new Error('로그인한 사용자만 회원정보를 수정할 수 있습니다.');
    }
    const updatedUser = { ...currentUser, name, email };
    localStorage.setItem('toss_stock_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const deleteAccount = () => {
    localStorage.removeItem('toss_stock_user');
    setCurrentUser(null);
    setWatchlist([]);
  };

  const logout = () => {
    localStorage.removeItem('toss_stock_user');
    setCurrentUser(null);
    setWatchlist([]);
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
        updateProfile,
        deleteAccount,
        logout
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