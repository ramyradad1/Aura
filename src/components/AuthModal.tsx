import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Lock, User, Eye, EyeOff, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithEmail, registerWithEmail, resetPassword, login: googleSignIn, loginError } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        onClose();
      } else if (mode === 'register') {
        await registerWithEmail(name, email, password);
        onClose();
      } else if (mode === 'forgot_password') {
        await resetPassword(email);
        setResetSent(true);
      }
    } catch (err: any) {
      setLocalError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await googleSignIn();
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMode('login');
    setEmail('');
    setPassword('');
    setName('');
    setLocalError(null);
    setResetSent(false);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" dir={dir}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-surface rounded-2xl shadow-luxury-lg overflow-hidden border border-outline-variant/30"
        >
          {/* Decorative Header Background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-primary/5 rounded-t-2xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <button
            onClick={handleClose}
            className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-10 p-2 rounded-full hover:bg-surface-variant transition-colors text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/50`}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative p-8 pt-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4 shrink-0 shadow-sm border border-primary/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-headline text-primary mb-2 tracking-tight">
                {mode === 'login' && t('Welcome to Aura')}
                {mode === 'register' && t('Join the Aura Circle')}
                {mode === 'forgot_password' && t('Reset Password')}
              </h2>
              <p className="text-on-surface-variant text-sm font-medium">
                {mode === 'login' && t('Sign in to access your exclusive fragrance collection.')}
                {mode === 'register' && t('Create an account for personalized recommendations.')}
                {mode === 'forgot_password' && t('Enter your email to receive a password reset link.')}
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {(loginError || localError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-error/10 text-error p-3 rounded-lg text-sm text-center border border-error/20 font-medium"
                >
                  {t(localError || loginError || '')}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {resetSent && mode === 'forgot_password' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-tertiary-gold/20 text-tertiary p-3 rounded-lg text-sm text-center border border-tertiary-gold/30 font-medium"
                >
                  {t('Reset link sent! Please check your email.')}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {mode === 'register' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="relative"
                  >
                    <label className="block text-sm font-medium text-on-surface mb-1.5 ml-1">{t('Full Name')}</label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                        <User className="h-5 w-5 text-outline" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={`block w-full ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-outline-variant rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface shadow-sm placeholder:text-outline-variant`}
                        placeholder={t("John Doe")}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5 ml-1">{t('Email Address')}</label>
                <div className="relative">
                  <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                    <Mail className="h-5 w-5 text-outline" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full ${language === 'ar' ? 'pr-10 pl-3' : 'pl-10 pr-3'} py-2.5 border border-outline-variant rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface shadow-sm placeholder:text-outline-variant`}
                    placeholder={t("you@example.com")}
                  />
                </div>
              </div>

              {mode !== 'forgot_password' && (
                <div>
                  <div className="flex justify-between items-center mb-1.5 ml-1">
                    <label className="block text-sm font-medium text-on-surface">{t('Password')}</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot_password')}
                        className="text-xs text-primary hover:text-primary-container transition-colors font-medium focus:outline-none"
                      >
                        {t('Forgot password?')}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className={`absolute inset-y-0 ${language === 'ar' ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                      <Lock className="h-5 w-5 text-outline" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-10 py-2.5 border border-outline-variant rounded-xl bg-surface-container-low focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface shadow-sm placeholder:text-outline-variant"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute inset-y-0 ${language === 'ar' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center text-outline hover:text-on-surface transition-colors focus:outline-none`}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-primary text-surface py-3 px-4 rounded-xl hover:bg-primary-container transition-colors font-medium disabled:opacity-70 disabled:cursor-not-allowed mt-8 shadow-md group relative overflow-hidden"
              >
                {/* Shine effect on hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent" />
                
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="relative z-10">
                      {mode === 'login' && t('Sign In')}
                      {mode === 'register' && t('Create Account')}
                      {mode === 'forgot_password' && t('Send Reset Link')}
                    </span>
                    <ArrowRight className={`w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform relative z-10 ${language === 'ar' ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                  </>
                )}
              </button>
            </form>

            {mode !== 'forgot_password' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-outline-variant/60"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-surface text-outline font-medium text-xs uppercase tracking-wider">{t('Or continue with')}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full flex items-center justify-center gap-3 bg-surface border border-outline-variant py-2.5 px-4 rounded-xl hover:bg-surface-container-low hover:border-outline transition-all text-on-surface font-medium shadow-sm group"
                >
                  <svg className="w-5 h-5 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  {t('Google')}
                </button>
              </>
            )}

            {/* Footer toggle */}
            <div className="mt-8 text-center text-sm text-on-surface-variant">
              {mode === 'login' ? (
                <p>
                  {t("Don't have an account?")}{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-primary font-bold hover:text-primary-container transition-colors focus:outline-none"
                  >
                    {t('Register now')}
                  </button>
                </p>
              ) : (
                <p>
                  {t('Back to')}{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-primary font-bold hover:text-primary-container transition-colors focus:outline-none"
                  >
                    {t('Sign in')}
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
