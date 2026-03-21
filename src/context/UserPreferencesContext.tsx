import React, { createContext, useContext, useState, useEffect } from 'react';

interface UserPreferencesContextType {
  wishlist: string[];
  compareList: string[];
  viewedProducts: string[];
  quizResults: any | null;
  toggleWishlist: (id: string) => void;
  toggleCompare: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  isInCompare: (id: string) => boolean;
  clearCompare: () => void;
  addViewedProduct: (id: string) => void;
  setQuizResults: (results: any) => void;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export const UserPreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  const [compareList, setCompareList] = useState<string[]>(() => {
    const saved = localStorage.getItem('compareList');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewedProducts, setViewedProducts] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('viewedProducts');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [quizResults, setQuizResultsState] = useState<any | null>(() => {
    try {
      const saved = localStorage.getItem('quizResults');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('compareList', JSON.stringify(compareList));
  }, [compareList]);

  useEffect(() => {
    localStorage.setItem('viewedProducts', JSON.stringify(viewedProducts));
  }, [viewedProducts]);

  useEffect(() => {
    if (quizResults) {
      localStorage.setItem('quizResults', JSON.stringify(quizResults));
    }
  }, [quizResults]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleCompare = (id: string) => {
    setCompareList(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 4) {
        alert('يمكنك مقارنة 4 عطور كحد أقصى');
        return prev;
      }
      return [...prev, id];
    });
  };

  const isInWishlist = (id: string) => wishlist.includes(id);
  const isInCompare = (id: string) => compareList.includes(id);
  const clearCompare = () => setCompareList([]);

  const addViewedProduct = (id: string) => {
    setViewedProducts(prev => {
      if (prev.includes(id)) return prev;
      // Keep last 20 viewed products
      const updated = [id, ...prev].slice(0, 20);
      return updated;
    });
  };

  const setQuizResults = (results: any) => {
    setQuizResultsState(results);
  };

  return (
    <UserPreferencesContext.Provider value={{ 
      wishlist, 
      compareList, 
      viewedProducts,
      quizResults,
      toggleWishlist, 
      toggleCompare, 
      isInWishlist, 
      isInCompare,
      clearCompare,
      addViewedProduct,
      setQuizResults
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};
