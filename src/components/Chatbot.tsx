import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { chatWithGemini } from '../utils/geminiUtils';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'مرحباً! أنا المساعد الذكي لمتجر Aura. كيف يمكنني مساعدتك في اختيار العطر المناسب اليوم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithGemini(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response || 'خطأ غير متوقع' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickSuggestions = [
    'أفضل عطر رجالي',
    'عطور مسائية',
    'عطور فريش للصيف'
  ];

  return (
    <>
      <button
        title="الدردشة الذكية"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-xl shadow-primary/20 hover:opacity-90 transition-opacity z-50 flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 h-[520px] bg-surface rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-outline-variant/20"
          >
            {/* Header */}
            <div className="p-5 bg-linear-to-l from-primary to-primary-container text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-tertiary-gold rounded-lg flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#241a00]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg">Aura Concierge</h3>
                  <p className="text-white/50 text-[10px] uppercase tracking-widest">المساعد الذكي</p>
                </div>
              </div>
              <button title="إغلاق الدردشة" onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" dir="rtl">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white border border-outline-variant/20 text-on-surface rounded-tl-none shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-end">
                  <div className="bg-white border border-outline-variant/20 text-outline p-3.5 rounded-2xl rounded-tl-none shadow-sm text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 animate-pulse text-tertiary-gold" />
                    يفكر...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto custom-scrollbar" dir="rtl">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); }}
                    className="px-3 py-1.5 border border-primary/20 text-primary rounded-full text-[11px] whitespace-nowrap hover:bg-secondary-container/30 transition-colors font-medium"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-outline-variant/10">
              <div className="flex gap-2" dir="rtl">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="اسأل عن عطر..."
                  className="flex-1 px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/20 text-sm"
                />
                <button
                  title="إرسال"
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="p-3 bg-tertiary-gold text-[#241a00] rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
