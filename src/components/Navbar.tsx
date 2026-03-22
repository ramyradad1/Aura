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
      <header className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-xl border-b border-primary/5">
        <nav className="max-w-[1920px] mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between gap-4">
          
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
                    className={`uppercase text-xs font-semibold tracking-[0.05em] flex items-center gap-1.5 transition-colors ${
                      isActive ? (link.highlight ? 'text-[#4e3d00]' : 'text-primary') : (link.highlight ? 'text-tertiary hover:text-[#4e3d00]' : 'text-primary/70 hover:text-primary')
                    }`}
                  >
                    {link.icon && <link.icon className="h-3.5 w-3.5" />}
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4 justify-end">
            <Button
              variant="secondary"
              onPress={handleLanguageToggle}
              className="bg-surface-container-low text-primary min-w-0 px-3 hover:bg-surface-container h-8 sm:h-9 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="hidden sm:inline-block font-bold">
                  {language === 'ar' ? 'English' : 'عربي'}
                </span>
              </div>
            </Button>

            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsSearchOpen(!isSearchOpen)}
              className="text-primary/60 hover:text-primary min-w-8 w-8 h-8 sm:w-9 sm:h-9"
            >
              <Search className="w-5 h-5" />
            </Button>

            <div className="hidden sm:flex items-center">
              <Badge content={compareList.length} isInvisible={compareList.length === 0} color="primary" size="sm">
                <Button isIconOnly variant="light" className="text-primary/60 hover:text-primary w-9 h-9" onPress={() => navigate('/compare')}>
                  <GitCompare className="w-5 h-5" />
                </Button>
              </Badge>
            </div>

            <div className="hidden sm:flex items-center">
              <Badge content={wishlist.length} isInvisible={wishlist.length === 0} color="primary" size="sm">
                <Button isIconOnly variant="light" className="text-primary/60 hover:text-primary w-9 h-9" onPress={() => navigate('/wishlist')}>
                  <Heart className="w-5 h-5" />
                </Button>
              </Badge>
            </div>

            <div className="flex items-center">
              <Badge content={items.length} isInvisible={items.length === 0} color="primary" size="sm">
                <Button isIconOnly variant="light" className="text-primary/60 hover:text-primary w-8 h-8 sm:w-9 sm:h-9" onPress={() => navigate('/cart')}>
                  <ShoppingBag className="w-5 h-5" />
                </Button>
              </Badge>
            </div>

            {/* User / Profile */}
            <div className="hidden sm:flex ml-2 items-center">
              {user ? (
                <Dropdown>
                  <DropdownTrigger>
                    <button className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-secondary-container transition-transform focus:outline-none flex items-center justify-center bg-primary/10 text-primary font-bold">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(user.displayName?.charAt(0) || "U").toUpperCase()}</span>
                      )}
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Profile Actions">
                    <DropdownItem key="profile" textValue="Profile" className="h-14 gap-2">
                      <div className="flex flex-col text-primary font-bold">
                        <span className="font-semibold">{t('مرحباً')}</span>
                        <span className="font-semibold text-primary/70">{user.email}</span>
                      </div>
                    </DropdownItem>
                    {isAdmin && (
                      <DropdownItem key="admin" textValue="Admin" onPress={() => navigate('/admin')}>
                        <div className="flex items-center gap-2 text-primary">
                          <Sparkles className="w-4 h-4" />
                          <span>{t('لوحة التحكم')}</span>
                        </div>
                      </DropdownItem>
                    )}
                    <DropdownItem key="settings" textValue="Settings" onPress={() => navigate('/profile')}>
                      <div className="flex items-center gap-2 text-primary">
                        <User className="w-4 h-4" />
                        <span>{t('الملف الشخصي')}</span>
                      </div>
                    </DropdownItem>
                    <DropdownItem key="logout" textValue="Logout" className="text-danger" onPress={logout}>
                      <div className="flex items-center gap-2 text-danger">
                        <LogOut className="w-4 h-4" />
                        <span>{t('تسجيل الخروج')}</span>
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <Button
                  onPress={openAuthModal}
                  variant="primary"
                  className="font-bold tracking-widest uppercase shadow-lg shadow-primary/20 bg-primary text-white h-9 px-4 rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{t('تسجيل الدخول')}</span>
                  </div>
                </Button>
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
            className="fixed top-16 left-0 w-full z-40 bg-surface/90 backdrop-blur-md border-b border-primary/5 shadow-luxury"
          >
            <div className="max-w-2xl mx-auto px-6 py-4">
              <form onSubmit={handleSearch}>
                <div className="relative flex items-center w-full">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-default-400">
                    <Search className="w-5 h-5" />
                  </span>
                  <input
                    autoFocus
                    placeholder={t('ابحث عن عطر أو ماركة...')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 hover:bg-surface-container rounded-full h-12 pl-12 pr-12 outline-none focus:ring-2 focus:ring-primary/20 text-primary transition-all"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Button isIconOnly variant="ghost" onPress={() => setIsSearchOpen(false)} className="text-default-400 opacity-70 hover:opacity-100">
                      <X className="w-4 h-4" />
                    </Button>
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

