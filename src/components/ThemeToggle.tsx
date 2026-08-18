import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../context/TranslationContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'button';
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  variant = 'icon',
  className = '',
  showLabel = false,
}: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const labelText = isDark ? t('الوضع النهاري') : t('الوضع الليلي');

  if (variant === 'button' || showLabel) {
    return (
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={toggleTheme}
        aria-label={labelText}
        title={labelText}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
          isDark
            ? 'bg-navy-800/80 text-amber-300 border-amber-500/20 hover:bg-navy-700'
            : 'bg-primary/5 text-primary border-primary/10 hover:bg-primary/10'
        } ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="sun"
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: 90, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Sun className="w-4 h-4 text-amber-400" />
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              initial={{ rotate: 90, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              exit={{ rotate: -90, scale: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center"
            >
              <Moon className="w-4 h-4 text-indigo-900" />
            </motion.span>
          )}
        </AnimatePresence>
        <span>{labelText}</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      type="button"
      onClick={toggleTheme}
      aria-label={labelText}
      title={labelText}
      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors focus:outline-none ${
        isDark
          ? 'bg-navy-800/80 text-amber-300 hover:bg-navy-700 border border-amber-500/20 shadow-sm'
          : 'bg-primary/5 text-primary/80 hover:text-primary hover:bg-primary/10 border border-transparent'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun-icon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center"
          >
            <Sun className="w-5 h-5 text-amber-400" />
          </motion.div>
        ) : (
          <motion.div
            key="moon-icon"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex items-center justify-center"
          >
            <Moon className="w-5 h-5 text-primary" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
