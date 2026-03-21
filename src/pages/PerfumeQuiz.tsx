import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getQuizRecommendations } from '../utils/geminiUtils';
import PerfumeCard from '../components/PerfumeCard';
import SEOHead from '../components/SEOHead';
import { HelpCircle, Sparkles, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockPerfumes } from '../data/mockData';
import { useTranslation } from '../context/TranslationContext';

export default function PerfumeQuiz() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  const questions = [
    {
      id: 'scentType',
      question: t('ما هو نوع الروائح الذي تفضله؟'),
      options: [
        { value: 'floral', label: t('زهري (ورود، ياسمين)'), icon: '🌸' },
        { value: 'woody', label: t('خشبي (خشب الصندل، عود)'), icon: '🌲' },
        { value: 'citrus', label: t('حمضي (ليمون، برتقال)'), icon: '🍋' },
        { value: 'oriental', label: t('شرقي (توابل، عنبر)'), icon: '🕌' },
        { value: 'fresh', label: t('منعش (روائح بحرية، نظافة)'), icon: '🌊' }
      ]
    },
    {
      id: 'mood',
      question: t('ما هو الانطباع الذي تريد تركه؟'),
      options: [
        { value: 'elegant', label: t('أنيق وراقي'), icon: '🎩' },
        { value: 'energetic', label: t('حيوي ونشيط'), icon: '⚡' },
        { value: 'romantic', label: t('رومانسي وجذاب'), icon: '❤️' },
        { value: 'mysterious', label: t('غامض ومميز'), icon: '🌑' },
        { value: 'calm', label: t('هادئ ومريح'), icon: '🍃' }
      ]
    },
    {
      id: 'occasion',
      question: t('متى تخطط لاستخدام هذا العطر؟'),
      options: [
        { value: 'daily', label: t('استخدام يومي (عمل، دراسة)'), icon: '💼' },
        { value: 'evening', label: t('مناسبات مسائية وسهرات'), icon: '✨' },
        { value: 'special', label: t('مناسبات خاصة جداً'), icon: '💍' },
        { value: 'sport', label: t('بعد الرياضة أو في الصيف'), icon: '🏃' }
      ]
    },
    {
      id: 'intensity',
      question: t('كيف تفضل قوة وثبات العطر؟'),
      options: [
        { value: 'subtle', label: t('خفيف وهادئ'), icon: '🌬️' },
        { value: 'moderate', label: t('متوسط ومتوازن'), icon: '⚖️' },
        { value: 'strong', label: t('قوي وفواح جداً'), icon: '🔥' }
      ]
    },
    {
      id: 'details',
      question: t('هل لديك أي تفضيلات إضافية؟ (اختياري)'),
      type: 'textarea',
      placeholder: t('مثال: أحب روائح الفانيليا بوضوح، أو أبحث عن عطر للعمل في الصباح...'),
      options: []
    }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any>({});
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [pastResults, setPastResults] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('quizResults');
    if (saved) {
      try {
        setPastResults(JSON.parse(saved));
      } catch (e) {
        console.error("Error parsing past results");
      }
    }
  }, []);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev: any) => ({ ...prev, [questionId]: value }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      getRecommendations();
    }
  };

  const getRecommendations = async () => {
    setLoading(true);
    setIsFinished(true);
    try {
      const snapshot = await getDocs(collection(db, 'perfumes'));
      const allPerfumes = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
      // Use mock data if empty
      const dataToUse = allPerfumes.length > 0 ? allPerfumes : mockPerfumes;

      const recommendedIds = await getQuizRecommendations(answers, dataToUse);
      const recommendedPerfumes = dataToUse.filter(p => recommendedIds.includes(p.id));
      const finalRecs = recommendedPerfumes.length > 0 ? recommendedPerfumes : dataToUse.slice(0, 3);
      setRecommendations(finalRecs);
      
      localStorage.setItem('quizResults', JSON.stringify({
        answers,
        recommendations: finalRecs,
        date: new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error getting recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendations([]);
    setIsFinished(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4" dir={dir}>
      <SEOHead
        title={t("اختبار العطر المثالي")}
        description={t("اكتشف عطرك المثالي مع اختبار Aura Perfumes الذكي — أجب على بضعة أسئلة بسيطة وسيقترح عليك الذكاء الاصطناعي أفضل العطور التي تناسب شخصيتك وذوقك.")}
        keywords={t("اختبار عطر, اختبار العطر المثالي, quiz عطور, اختيار عطر, Aura Perfumes quiz, توصيات عطور")}
        ogUrl="/quiz"
      />
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex p-4 bg-indigo-50 rounded-3xl mb-4">
            <HelpCircle className="h-10 w-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{t('اختبار العطر المثالي')}</h1>
          <p className="text-gray-500">{t('أجب على بضعة أسئلة وسنجد لك العطر الذي يناسب شخصيتك')}</p>
          {pastResults && currentStep === 0 && Object.keys(answers).length === 0 && !isFinished && (
            <button 
              onClick={() => {
                setAnswers(pastResults.answers);
                setRecommendations(pastResults.recommendations);
                setIsFinished(true);
              }}
              className="mt-6 flex items-center gap-2 mx-auto text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 px-6 py-3 rounded-full transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              {t('عرض نتائجي السابقة')}
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
          {!isFinished ? (
            <div className="p-8 md:p-12 flex-1 flex flex-col">
              <div className="flex flex-col gap-3 mb-8">
                <span className={`text-sm font-bold text-indigo-600 uppercase tracking-widest ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('السؤال')} {currentStep + 1} {t('من')} {questions.length}
                </span>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden" dir={dir}>
                  <motion.div 
                    className="bg-indigo-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep) / (questions.length - 1)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">{questions[currentStep].question}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(questions[currentStep] as any).type === 'textarea' ? (
                      <div className="col-span-1 md:col-span-2 space-y-6">
                        <textarea
                          value={answers.details || ''}
                          onChange={(e) => setAnswers((prev: any) => ({...prev, details: e.target.value}))}
                          placeholder={(questions[currentStep] as any).placeholder}
                          className={`w-full h-32 p-4 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 resize-none outline-none transition-all ${language === 'ar' ? 'text-right' : 'text-left'}`}
                          dir={dir}
                        />
                        <button
                          onClick={() => handleAnswer(questions[currentStep].id, answers.details || '')}
                          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          {t('إظهار النتائج')}
                        </button>
                      </div>
                    ) : (
                      questions[currentStep].options.map((option) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={option.value}
                          onClick={() => handleAnswer(questions[currentStep].id, option.value)}
                          className={`flex items-center gap-4 p-5 rounded-2xl border-2 border-gray-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all ${language === 'ar' ? 'text-right' : 'text-left'} group`}
                        >
                          <span className="text-3xl group-hover:scale-110 transition-transform">{option.icon}</span>
                          <span className="font-bold text-gray-700 group-hover:text-indigo-900">{option.label}</span>
                        </motion.button>
                      ))
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="mt-12 flex justify-between">
                <button
                  disabled={currentStep === 0}
                  onClick={() => {
                    setCurrentStep(currentStep - 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`flex items-center gap-2 font-bold ${currentStep === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900'}`}
                >
                  {language === 'ar' ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
                  {t('السابق')}
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 md:p-12 flex-1 flex flex-col items-center justify-center text-center">
              {loading ? (
                <div className="space-y-6">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-indigo-600 mx-auto"></div>
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-400 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">{t('جاري تحليل إجاباتك...')}</h2>
                    <p className="text-gray-500">{t('نبحث في مجموعتنا عن أفضل العطور التي تناسب ذوقك')}</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  <div className="mb-8">
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">{t('اكتشافاتك المثالية')}</h2>
                    <p className="text-gray-500">{t('بناءً على تفضيلاتك، نقترح عليك هذه العطور:')}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {recommendations.map((perfume) => (
                      <PerfumeCard key={perfume.id} {...perfume} />
                    ))}
                  </div>

                  <button
                    onClick={resetQuiz}
                    className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    <RefreshCw className="h-5 w-5" />
                    {t('إعادة الاختبار')}
                  </button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
