import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/TranslationContext';

export default function Footer() {
  const { isAdmin } = useAuth();
  const { t, language } = useTranslation();
  
  return (
    <footer className="relative bg-surface text-on-surface overflow-hidden border-t border-primary/5" dir={language === 'ar' ? 'rtl' : 'ltr'} role="contentinfo">
      {/* Accent line */}
      <div className="h-px w-full bg-linear-to-r from-transparent via-primary/10 to-transparent" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-12">
        {/* Newsletter */}
        <div className="bg-primary rounded-2xl p-8 md:p-10 mb-16 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-primary/20">
          <div>
            <h3 className="text-white text-xl font-serif mb-2">{t('اشترك في نشرتنا البريدية')}</h3>
            <p className="text-white/60 text-sm font-light">{t('كن أول من يعرف عن العطور الجديدة والخصومات الحصرية')}</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <input 
              type="email" 
              placeholder={t('بريدك الإلكتروني')}
              className={`px-5 py-3 bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/40 focus:ring-2 focus:ring-tertiary-gold/50 outline-none flex-1 md:w-72 text-sm ${language === 'ar' ? 'text-right' : 'text-left'}`}
              dir="ltr"
            />
            <button className={`px-6 py-3 bg-tertiary-gold text-[#241a00] font-bold rounded-lg hover:shadow-lg hover:shadow-tertiary-gold/20 transition-all flex items-center gap-2 shrink-0 text-sm uppercase tracking-widest ${language === 'ar' ? 'flex-row' : 'flex-row-reverse'}`}>
              {t('اشتراك')} <ArrowLeft className={`h-4 w-4 ${language === 'en' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-5" aria-label={t('Aura Perfumes — الصفحة الرئيسية')}>
              <span className="font-serif text-3xl tracking-widest text-primary">Aura</span>
            </Link>
            <p className="text-xs tracking-widest uppercase text-primary/40 mb-6">{t('The Fragrant Atelier')}</p>
            <p className="text-on-surface-variant mb-6 text-sm leading-relaxed font-light">
              {t('متجر عطور مستوحاة من أشهر الماركات العالمية بجودة عالية وثبات يدوم. اكتشف عطرك المفضل باستخدام أدوات الذكاء الاصطناعي المتقدمة.')}
            </p>
            <div className="flex gap-3">
              {[
                { href: 'https://www.facebook.com/auraperfumes', icon: Facebook, label: t('فيسبوك') },
                { href: 'https://twitter.com/auraperfumes', icon: Twitter, label: t('تويتر') },
                { href: 'https://www.instagram.com/auraperfumes', icon: Instagram, label: t('إنستجرام') },
              ].map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-surface-container-low hover:bg-secondary-container/40 border border-outline-variant/20 rounded-lg flex items-center justify-center text-primary/40 hover:text-primary transition-all" aria-label={`${t('تابعنا على')} ${social.label}`}>
                  <social.icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>
          
          <nav aria-label={t('التسوق')}>
            <h3 className="text-primary font-bold mb-5 text-xs tracking-widest uppercase">{t('التسوق')}</h3>
            <ul className="space-y-3">
              {[
                { to: '/shop/all', text: t('جميع العطور') },
                { to: '/shop/men', text: t('عطور رجالية') },
                { to: '/shop/women', text: t('عطور نسائية') },
                { to: '/shop/unisex', text: t('عطور للجنسين') },
                { to: '/quiz', text: t('اختبار العطور') },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-on-surface-variant hover:text-primary transition-colors text-sm">{link.text}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={t('روابط سريعة')}>
            <h3 className="text-primary font-bold mb-5 text-xs tracking-widest uppercase">{t('روابط سريعة')}</h3>
            <ul className="space-y-3">
              {[
                { to: '/about', text: t('من نحن') },
                { to: '/blog', text: t('المدونة') },
                { to: '/ai-studio', text: t('ستوديو الذكاء الاصطناعي'), adminOnly: true },
                { to: '/compare', text: t('مقارنة العطور') },
                { to: '/contact', text: t('اتصل بنا') },
                { to: '/privacy', text: t('سياسة الخصوصية') },
                { to: '/terms', text: t('الشروط والأحكام') },
                { to: '/refund', text: t('سياسة الاسترجاع') },
              ].filter(link => !link.adminOnly || isAdmin).map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-on-surface-variant hover:text-primary transition-colors text-sm">{link.text}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-primary font-bold mb-5 text-xs tracking-widest uppercase">{t('التواصل')}</h3>
            <address className="not-italic">
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-surface-container-low border border-outline-variant/20 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-primary/40" />
                  </div>
                  <span className="text-sm text-on-surface-variant">{t('القاهرة، مصر')}</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-surface-container-low border border-outline-variant/20 rounded-lg flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-primary/40" />
                  </div>
                  <a href="tel:+201000000000" className="text-sm text-on-surface-variant hover:text-primary transition-colors" dir="ltr">+20 100 000 0000</a>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-surface-container-low border border-outline-variant/20 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-primary/40" />
                  </div>
                  <a href="mailto:contact@aura-perfumes.com" className="text-sm text-on-surface-variant hover:text-primary transition-colors">contact@aura-perfumes.com</a>
                </li>
              </ul>
            </address>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary/5 text-center text-xs tracking-widest uppercase text-on-surface-variant/70">
          <p>© {new Date().getFullYear()} Aura Perfumes. {t('جميع الحقوق محفوظة.')}</p>
        </div>
      </div>
    </footer>
  );
}
