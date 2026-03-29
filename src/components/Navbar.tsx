import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Sparkles, Heart, GitCompare, HelpCircle, Search, AlertCircle, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useTranslation } from '../context/TranslationContext';
import { motion, AnimatePresence } from 'motion/react';
import { Badge, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@heroui/react';
import AuthModal from './AuthModal';

export default function AppNavbar() {
  const { user, isAdmin, logout, loginError, isAuthModalOpen, setIsAuthModalOpen, openAuthModal } = useAuth();
  const { items } = useCart();
  const { wishlist, compareList } = useUserPreferences();
  const { t, language, setLanguage } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop/all?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLanguageToggle = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  const navLinks = [
    { name: t('رجالي'), path: '/shop/men' },
    { name: t('نسائي'), path: '/shop/women' },
    { name: t('للجنسين'), path: '/shop/unisex' },
    { name: t('مدونة'), path: '/blog' },
    { name: t('اختبار العطور'), path: '/quiz', icon: HelpCircle },
    { name: t('استوديو الذكاء'), path: '/ai-studio', icon: Sparkles, highlight: true, adminOnly: true },
  ];

  const visibleLinks = navLinks.filter(link => !link.adminOnly || isAdmin);

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface/70 backdrop-blur-2xl border-b border-white/20 shadow-sm transition-all duration-300">
        <nav className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-4">
            <button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden text-primary/80 hover:text-primary transition-colors p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <Link to="/" className="flex items-center gap-2 group">
              <span className="font-serif text-2xl sm:text-3xl tracking-widest text-primary">Aura</span>
            </Link>
          </div>

          {/* Desktop Links */}
          <ul className="hidden lg:flex items-center gap-8 justify-center flex-1">
            {visibleLinks.map((link) => {
              const isActive = location.pathname.startsWith(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`relative uppercase text-xs font-bold tracking-[0.08em] flex items-center gap-1.5 py-2 transition-colors group ${
                      isActive ? (link.highlight ? 'text-[#4e3d00]' : 'text-primary') : (link.highlight ? 'text-tertiary hover:text-[#4e3d00]' : 'text-primary/70 hover:text-primary')
                    }`}
                  >
                    {link.icon && <link.icon className="h-4 w-4" />}
                    {link.name}
                    <span className={`absolute -bottom-1 left-0 w-full h-[2px] rounded-full transition-transform origin-left duration-300 ${isActive ? 'scale-x-100 bg-primary' : 'scale-x-0 bg-primary/40 group-hover:scale-x-100'}`}></span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 justify-end">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                onPress={handleLanguageToggle}
                className="bg-primary/5 text-primary min-w-0 px-3 hover:bg-primary/10 h-10 rounded-xl font-bold border-0"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline-block">
                    {language === 'ar' ? 'English' : 'عربي'}
                  </span>
                </div>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                isIconOnly
                variant="ghost"
                onPress={() => setIsSearchOpen(!isSearchOpen)}
                className="text-primary/70 hover:text-primary bg-transparent hover:bg-primary/5 min-w-10 w-10 h-10 rounded-full border-0"
              >
                <Search className="w-5 h-5" />
              </Button>
            </motion.div>

            <div className="hidden sm:flex items-center">
              <Badge content={compareList.length.toString()} isInvisible={compareList.length === 0} color="default" size="sm" shape="circle">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button isIconOnly variant="ghost" className="text-primary/70 hover:text-primary bg-transparent hover:bg-primary/5 min-w-10 w-10 h-10 rounded-full border-0" onPress={() => navigate('/compare')}>
                    <GitCompare className="w-5 h-5" />
                  </Button>
                </motion.div>
              </Badge>
            </div>

            <div className="hidden sm:flex items-center">
              <Badge content={wishlist.length.toString()} isInvisible={wishlist.length === 0} color="danger" size="sm" shape="circle">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button isIconOnly variant="ghost" className="text-primary/70 hover:text-danger bg-transparent hover:bg-danger/10 min-w-10 w-10 h-10 rounded-full border-0" onPress={() => navigate('/wishlist')}>
                    <Heart className="w-5 h-5" />
                  </Button>
                </motion.div>
              </Badge>
            </div>

            <div className="flex items-center">
              <Badge content={items.length > 0 ? items.length.toString() : undefined} color="default" size="sm">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button isIconOnly title={t('سلة التسوق')} variant="ghost" className="text-primary/70 hover:text-primary bg-transparent hover:bg-primary/5 min-w-10 w-10 h-10 rounded-full border-0 shadow-none" onPress={() => navigate('/cart')}>
                    <ShoppingBag className="w-5 h-5" />
                  </Button>
                </motion.div>
              </Badge>
            </div>

            {/* User / Profile */}
            <div className="hidden sm:flex ml-2 items-center">
              {user ? (
                <Dropdown>
                  <DropdownTrigger>
                    <motion.button 
                      whileHover={{ scale: 1.05 }} 
                      whileTap={{ scale: 0.95 }} 
                      className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/50 transition-all focus:outline-none outline-none flex items-center justify-center bg-primary/5 text-primary font-bold shadow-sm"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(user.displayName?.charAt(0) || "U").toUpperCase()}</span>
                      )}
                    </motion.button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions" className="p-2 min-w-[240px]">
                    <DropdownItem key="profile" textValue="Profile" className="h-auto py-3 opacity-100 cursor-default mb-2 border-b border-primary/10 rounded-none focus:outline-none outline-none ring-0 active:bg-transparent hover:bg-transparent">
                      <div className="flex flex-col gap-1 select-none pointer-events-none">
                        <span className="text-[10px] uppercase tracking-widest text-primary/50 font-bold">{t('مرحباً')}</span>
                        <span className="text-sm font-bold text-primary truncate max-w-[200px]">{user.displayName || user.email?.split('@')[0]}</span>
                        <span className="text-[10px] text-primary/40 font-medium truncate">{user.email}</span>
                      </div>
                    </DropdownItem>
                    
                    {isAdmin && (
                      <DropdownItem 
                        key="admin" 
                        textValue="Admin" 
                        onPress={() => navigate('/admin')}
                        className="py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-4 h-4 text-tertiary" />
                          <span className="text-sm font-bold text-primary">{t('لوحة التحكم')}</span>
                        </div>
                      </DropdownItem>
                    )}
                    
                    <DropdownItem 
                      key="settings" 
                      textValue="Settings" 
                      onPress={() => navigate('/profile')}
                      className="py-2.5"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-primary/60" />
                        <span className="text-sm font-bold text-primary">{t('الملف الشخصي')}</span>
                      </div>
                    </DropdownItem>
                    
                    <DropdownItem 
                      key="logout" 
                      textValue="Logout" 
                      className="text-danger mt-1 py-2.5" 
                      onPress={logout}
                    >
                      <div className="flex items-center gap-3 text-danger">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-bold">{t('تسجيل الخروج')}</span>
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onPress={openAuthModal}
                    className="font-bold tracking-widest uppercase shadow-luxury bg-gradient-to-r from-primary to-primary-container text-white h-10 px-5 rounded-xl border border-white/20"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{t('تسجيل الدخول')}</span>
                    </div>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-primary/10 overflow-hidden bg-surface/95 backdrop-blur-xl"
            >
              <ul className="flex flex-col px-6 py-6 gap-2">
                {visibleLinks.map((link, index) => (
                  <li key={`${link.name}-${index}`}>
                    <Link
                      className={`w-full text-lg flex items-center gap-3 py-2 ${
                        location.pathname.startsWith(link.path) ? (link.highlight ? 'text-tertiary font-bold' : 'text-primary font-bold') : 'text-primary/80'
                      }`}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon && <link.icon className="w-5 h-5" />}
                      {link.name}
                    </Link>
                  </li>
                ))}
                <li className="mt-4 pt-4 border-t border-primary/10 flex flex-col gap-4">
                  <Link to="/compare" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-primary/80 py-2">
                    <GitCompare className="w-5 h-5" />
                    {t('المقارنة')}
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-primary/80 py-2">
                    <Heart className="w-5 h-5" />
                    {t('المفضلة')}
                  </Link>
                  {!user && (
                    <Button
                      variant="primary"
                      className="mt-2 bg-primary text-white w-full h-12"
                      onPress={() => { setIsMenuOpen(false); openAuthModal(); }}
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <User className="w-4 h-4" />
                        <span>{t('تسجيل الدخول')}</span>
                      </div>
                    </Button>
                  )}
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Login Error Toast */}
      <AnimatePresence>
        {loginError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-60 py-3 px-4 bg-[#ffdad6] border border-error/20 rounded-xl flex items-center gap-3 text-sm text-[#93000a] shadow-lg"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            {loginError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-40 bg-surface/80 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-luxury-lg overflow-hidden"
          >
            <div className="p-2">
              <form onSubmit={handleSearch}>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">
                    <Search className="w-6 h-6" />
                  </span>
                  <input
                    autoFocus
                    placeholder={t('ابحث عن عطر أو ماركة...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent h-14 pl-14 pr-14 outline-none text-lg text-primary placeholder:text-primary/40 font-medium"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <motion.div whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }}>
                      <Button isIconOnly variant="ghost" onPress={() => setIsSearchOpen(false)} className="text-primary/50 hover:text-primary rounded-full border-0 shadow-none">
                        <X className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </span>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}

