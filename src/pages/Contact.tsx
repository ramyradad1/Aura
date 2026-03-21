import SEOHead from '../components/SEOHead';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '../context/TranslationContext';

export default function Contact() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(t('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.'));
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16" dir={dir}>
      <SEOHead
        title={t("اتصل بنا")}
        description={t("تواصل مع خدمة عملاء أورا للعطور لأي استفسار أو مساعدة. نحن هنا لخدمتكم.")}
        keywords={t("اتصل بنا, خدمة عملاء أورا للعطور, ارقام التواصل أورا")}
      />
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">{t('اتصل بنا')}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t('نحن هنا لمساعدتك. تواصل معنا لأي استفسار أو مساعدة تحتاجها.')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold mb-6">{t('معلومات التواصل')}</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('العنوان')}</h3>
                <p className="text-gray-600">{t('المملكة العربية السعودية، الرياض')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('رقم الهاتف')}</h3>
                <p className="text-gray-600" dir="ltr">+966 50 000 0000</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{t('البريد الإلكتروني')}</h3>
                <p className="text-gray-600">support@auraperfumes.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold mb-6">{t('أرسل لنا رسالة')}</h2>
          {status && (
            <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {status}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">{t('الاسم')}</label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('البريد الإلكتروني')}</label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">{t('الرسالة')}</label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Send className={`h-5 w-5 ${language === 'ar' ? 'rotate-180' : ''}`} />
              {t('إرسال')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
