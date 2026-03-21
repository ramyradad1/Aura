import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '201000000000'; // Replace with actual number

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  const message = encodeURIComponent('مرحباً! أحتاج مساعدة في اختيار عطر من Aura Perfumes 🌸');
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <div className="fixed bottom-24 left-6 z-50 flex items-end gap-3" dir="rtl">
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 max-w-[220px]"
          >
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-2 left-2 text-gray-400 hover:text-gray-600"
              aria-label="إغلاق"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <p className="text-sm text-gray-700 font-medium mb-3">
              محتاج مساعدة؟ كلمنا على واتساب! 💬
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[#25D366] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-[#20BD5A] transition-colors"
            >
              ابدأ محادثة
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setShowTooltip(!showTooltip)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-[#25D366] rounded-full shadow-xl shadow-[#25D366]/30 flex items-center justify-center hover:shadow-2xl hover:shadow-[#25D366]/40 transition-shadow"
        aria-label="تواصل معنا عبر واتساب"
      >
        <MessageCircle className="h-7 w-7 text-white" fill="white" />
      </motion.button>
    </div>
  );
}
