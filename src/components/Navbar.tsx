import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, LogOut, Sparkles, Heart, GitCompare, HelpCircle, Menu, X, Search, AlertCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useTranslation } from '../context/TranslationContext';
import { motion, AnimatePresence } from 'motion/react';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, isAdmin, logout, loginError, isAuthModalOpen, setIsAuthModalOpen, openAuthModal } = useAuth();
  const { items } = useCart();
  const { wishlist, compareList } = useUserPreferences();
  const { t, language, setLanguage } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const Badge = ({ count }: { count: number }) => count > 0 ? (
    <motion.span 
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      className={`absolute -top-1 ${dir === 'rtl' ? '-left-1' : '-right-1'} bg-tertiary-gold text-[#241a00] text-[10px] font-bold rounded-full h-[18px] w-[18px] flex items-center justify-center shadow-md`}
    >
      {count}
    </motion.span>
  ) : null;

  return (
    <>
      <nav 
        dir={dir}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-surface/95 backdrop-blur-2xl shadow-[0_32px_64px_-15px_rgba(46,0,82,0.05)] border-b border-primary/5' 
            : 'bg-surface/80 backdrop-blur-xl border-b border-transparent'
        }`} 
      >
        <div className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center py-5">
            {/* Logo + Nav Links */}
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-2 group">
                <span className="font-serif text-3xl tracking-widest text-primary">Aura</span>
              </Link>
              <div className="hidden lg:flex items-center gap-8">
                {navLinks.filter(link => !link.adminOnly || isAdmin).map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`uppercase text-xs font-semibold tracking-[0.05em] flex items-center gap-1.5 transition-all duration-200 ${
                      link.highlight 
                        ? 'text-tertiary hover:text-[#4e3d00]' 
                        : 'text-primary/70 hover:text-primary-container'
                    }`}
                  >
                    {link.icon && <link.icon className="h-3.5 w-3.5" />}
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleLanguageToggle}
                className="px-3 py-2 bg-surface-container-low hover:bg-surface-container border border-primary/10 text-primary hover:scale-95 rounded-xl transition-all duration-200 flex items-center gap-1.5 font-bold text-sm"
                title={t('تغيير اللغة')}
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline-block">{language === 'ar' ? 'English' : 'عربي'}</span>
              </button>

              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 text-primary/60 hover:text-primary hover:scale-95 rounded-xl transition-all duration-200"
                title={t('البحث')}
              >
                <Search className="h-[18px] w-[18px]" />
              </button>

              <Link to="/compare" className="relative p-2.5 text-primary/60 hover:text-primary hover:scale-95 rounded-xl transition-all duration-200 hidden sm:flex" title={t('المقارنة')}>
                <GitCompare className="h-[18px] w-[18px]" />
                <Badge count={compareList.length} />
              </Link>

              <Link to="/wishlist" className="relative p-2.5 text-primary/60 hover:text-primary hover:scale-95 rounded-xl transition-all duration-200 hidden sm:flex" title={t('المفضلة')}>
                <Heart className="h-[18px] w-[18px]" />
                <Badge count={wishlist.length} />
              </Link>

              <Link to="/cart" className="relative p-2.5 text-primary/60 hover:text-primary hover:scale-95 rounded-xl transition-all duration-200" title={t('السلة')}>
                <ShoppingBag className="h-[18px] w-[18px]" />
                <Badge count={items.length} />
              </Link>

              {/* Separator */}
              <div className="hidden sm:block w-px h-6 bg-primary/10 mx-1" />
              
              {user ? (
                <div className="flex items-center gap-1">
                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="hidden sm:flex items-center gap-1.5 text-xs font-bold bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
                    >
                      {t('لوحة التحكم')}
                    </Link>
                  )}
                  <Link to="/profile" className="p-1" title={t('الملف الشخصي')}>
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full ring-2 ring-secondary-container hover:ring-[#ddb7ff] transition-all" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center text-primary font-bold text-sm ring-2 ring-[#f0dbff]">
                        {user.displayName?.charAt(0) || <User className="h-4 w-4" />}
                      </div>
                    )}
                  </Link>
                  <button 
                    onClick={logout} 
                    className="p-2 text-primary/40 hover:text-error hover:bg-[#ffdad6]/40 rounded-xl transition-all duration-200" 
                    title={t('تسجيل الخروج')}
                  >
                    <LogOut className="h-[18px] w-[18px]" />
                  </button>
                </div>
              ) : (
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openAuthModal} 
                  className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white px-6 py-2.5 rounded-lg transition-all duration-300 bg-primary shadow-lg shadow-primary/20 hover:opacity-90"
                >
                  <User className="h-4 w-4" />
                  {t('تسجيل الدخول')}
                </motion.button>
              )}

              <button
                className="lg:hidden p-2.5 text-primary/60 hover:text-primary rounded-xl transition-all"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                title={t('القائمة')}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Login Error Toast */}
          <AnimatePresence>
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="py-3 px-4 bg-[#ffdad6] border border-error/20 rounded-xl mb-2 flex items-center gap-3 text-sm text-[#93000a]"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {loginError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <form onSubmit={handleSearch} className="py-4 border-t border-primary/5">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('ابحث عن عطر أو ماركة...')}
                      className={`w-full py-3.5 border border-outline-variant/30 rounded-full focus:ring-2 focus:ring-primary/10 focus:border-primary/30 bg-surface-container-low outline-none transition-all text-sm ${
                        dir === 'rtl' ? 'pr-5 pl-12 text-right' : 'pl-5 pr-12 text-left'
                      }`}
                      autoFocus
                    />
                    <Search className={`absolute top-3.5 h-5 w-5 text-outline ${dir === 'rtl' ? 'left-4' : 'right-4'}`} />
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="lg:hidden overflow-hidden border-t border-primary/5"
              >
                <div className="py-4 space-y-1">
                  {navLinks.filter(link => !link.adminOnly || isAdmin).map((link, i) => (
                    <motion.div 
                      key={link.path}
                      initial={{ opacity: 0, x: dir === 'rtl' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                          link.highlight ? 'text-tertiary bg-tertiary-fixed/20' : 'text-primary/70 hover:bg-surface-container-low'
                        }`}
                      >
                        {link.icon && <link.icon className="h-5 w-5" />}
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}
                  
                  <div className="border-t border-primary/5 pt-3 mt-3 space-y-1 px-1">
                    <Link to="/compare" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-primary/60 hover:bg-surface-container-low transition-colors">
                      <GitCompare className="h-5 w-5" />
                      {t('المقارنة')} {compareList.length > 0 && <span className="text-xs bg-secondary-container text-primary px-2 py-0.5 rounded-full font-bold">{compareList.length}</span>}
                    </Link>
                    <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-primary/60 hover:bg-surface-container-low transition-colors">
                      <Heart className="h-5 w-5" />
                      {t('المفضلة')} {wishlist.length > 0 && <span className="text-xs bg-secondary-container text-primary px-2 py-0.5 rounded-full font-bold">{wishlist.length}</span>}
                    </Link>
                    <button 
                      onClick={() => { handleLanguageToggle(); setIsMobileMenuOpen(false); }} 
                      className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl text-primary font-bold mt-2 transition-all bg-surface-container-low border border-primary/10 hover:bg-surface-container-high"
                    >
                      <Globe className="h-5 w-5" />
                      {language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
                    </button>
                    {!user && (
                      <button 
                        onClick={() => { openAuthModal(); setIsMobileMenuOpen(false); }} 
                        className="w-full flex items-center justify-center gap-3 px-3 py-3 rounded-xl text-white font-bold mt-2 transition-all bg-primary shadow-lg shadow-primary/20"
                      >
                        <User className="h-5 w-5" />
                        {t('تسجيل الدخول')}
                      </button>
                    )}
                    {user && isAdmin && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-xl text-primary font-bold hover:bg-secondary-container/30 transition-colors">
                        <Sparkles className="h-5 w-5" />
                        {t('لوحة التحكم')}
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-[76px]" />

      {/* Modal rendered via portal (inside AuthModal component) */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
