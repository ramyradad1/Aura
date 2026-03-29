import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Sparkles, Heart, GitCompare, HelpCircle, Search, AlertCircle, Globe, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useTranslation } from '../context/TranslationContext';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@heroui/react';
import AuthModal from './AuthModal';

export default function AppNavbar() {
  const { user, isAdmin, logout, loginError, isAuthModalOpen, setIsAuthModalOpen, openAuthModal } = useAuth();
  const { items } = useCart();
  const { wishlist, compareList } = useUserPreferences();
  const { t, language, setLanguage } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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

  // Custom icon button component to avoid HeroUI prop issues
  const IconBtn = ({ onClick, className, children, ariaLabel }: { onClick: () => void; className?: string; children: React.ReactNode; ariaLabel?: string }) => (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none ${className || ''}`}
    >
      {children}
    </motion.button>
  );

  // Badge dot component
  const BadgeDot = ({ count, color = 'bg-primary' }: { count: number; color?: string }) => {
    if (count === 0) return null;
    return (
      <span className={`absolute -top-0.5 -right-0.5 ${color} text-white text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center ring-2 ring-surface z-10`}>
        {count}
      </span>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-2xl border-b border-primary/5 shadow-sm transition-all duration-300">
        <nav className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
          
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-4">
            <button
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden text-primary/80 hover:text-primary transition-colors p-1 focus:outline-none"
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
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
            {/* Language Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLanguageToggle}
              className="flex items-center gap-2 bg-primary/5 text-primary px-3 h-10 rounded-xl font-bold hover:bg-primary/10 transition-colors focus:outline-none"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline-block text-xs tracking-wide">
                {language === 'ar' ? 'English' : 'عربي'}
              </span>
            </motion.button>

            {/* Search */}
            <IconBtn onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-primary/70 hover:text-primary hover:bg-primary/5" ariaLabel="Search">
              <Search className="w-5 h-5" />
            </IconBtn>

            {/* Compare - Desktop Only */}
            <div className="hidden sm:block relative">
              <IconBtn onClick={() => navigate('/compare')} className="text-primary/70 hover:text-primary hover:bg-primary/5" ariaLabel="Compare">
                <GitCompare className="w-5 h-5" />
              </IconBtn>
              <BadgeDot count={compareList.length} color="bg-primary/80" />
            </div>

            {/* Wishlist - Desktop Only */}
            <div className="hidden sm:block relative">
              <IconBtn onClick={() => navigate('/wishlist')} className="text-primary/70 hover:text-danger hover:bg-danger/5" ariaLabel="Wishlist">
                <Heart className="w-5 h-5" />
              </IconBtn>
              <BadgeDot count={wishlist.length} color="bg-danger" />
            </div>

            {/* Cart */}
            <div className="relative">
              <IconBtn onClick={() => navigate('/cart')} className="text-primary/70 hover:text-primary hover:bg-primary/5" ariaLabel="Cart">
                <ShoppingBag className="w-5 h-5" />
              </IconBtn>
              <BadgeDot count={items.length} />
            </div>

            {/* User / Profile */}
            <div className="hidden sm:flex ml-1 items-center">
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all focus:outline-none flex items-center justify-center bg-primary/5 text-primary font-bold shadow-sm"
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm">{(user.displayName?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase()}</span>
                    )}
                  </motion.button>

                  {/* Custom Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <>
                        {/* Backdrop */}
                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-14 right-0 z-50 w-[260px] bg-surface border border-primary/10 rounded-2xl shadow-luxury-lg overflow-hidden"
                        >
                          {/* User Info Header */}
                          <div className="px-5 py-4 border-b border-primary/8 bg-primary/[0.02]">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-primary/40 font-bold mb-1.5">{t('مرحباً')}</p>
                            <p className="text-sm font-bold text-primary truncate">{user.displayName || user.email?.split('@')[0]}</p>
                            <p className="text-[11px] text-primary/40 mt-0.5 truncate">{user.email}</p>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2 px-2">
                            {isAdmin && (
                              <button
                                onClick={() => { navigate('/admin'); setIsProfileOpen(false); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-primary hover:bg-primary/5 transition-colors text-right"
                              >
                                <Sparkles className="w-4 h-4 text-tertiary shrink-0" />
                                {t('لوحة التحكم')}
                              </button>
                            )}
                            <button
                              onClick={() => { navigate('/profile'); setIsProfileOpen(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-primary hover:bg-primary/5 transition-colors text-right"
                            >
                              <User className="w-4 h-4 text-primary/50 shrink-0" />
                              {t('الملف الشخصي')}
                            </button>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-primary/8 py-2 px-2">
                            <button
                              onClick={() => { logout(); setIsProfileOpen(false); }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-danger hover:bg-danger/5 transition-colors text-right"
                            >
                              <LogOut className="w-4 h-4 shrink-0" />
                              {t('تسجيل الخروج')}
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openAuthModal}
                  className="font-bold tracking-widest uppercase text-xs shadow-luxury bg-linear-to-r from-primary to-primary-container text-white h-10 px-5 rounded-xl border border-white/20 focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{t('تسجيل الدخول')}</span>
                  </div>
                </motion.button>
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
                    {compareList.length > 0 && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{compareList.length}</span>}
                  </Link>
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-primary/80 py-2">
                    <Heart className="w-5 h-5" />
                    {t('المفضلة')}
                    {wishlist.length > 0 && <span className="text-xs bg-danger/10 text-danger px-2 py-0.5 rounded-full font-bold">{wishlist.length}</span>}
                  </Link>
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-primary/80 py-2">
                        <User className="w-5 h-5" />
                        {t('الملف الشخصي')}
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-tertiary py-2">
                          <Sparkles className="w-5 h-5" />
                          {t('لوحة التحكم')}
                        </Link>
                      )}
                      <button
                        onClick={() => { logout(); setIsMenuOpen(false); }}
                        className="flex items-center gap-3 text-danger py-2 text-right w-full focus:outline-none"
                      >
                        <LogOut className="w-5 h-5" />
                        {t('تسجيل الخروج')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setIsMenuOpen(false); openAuthModal(); }}
                      className="mt-2 bg-primary text-white w-full h-12 rounded-xl font-bold flex items-center gap-2 justify-center focus:outline-none"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('تسجيل الدخول')}</span>
                    </button>
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
          <>
            <div className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-40 bg-surface border border-primary/10 rounded-2xl shadow-luxury-lg overflow-hidden"
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
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-primary/50 hover:text-primary hover:bg-primary/5 transition-colors focus:outline-none"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </span>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
