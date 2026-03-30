import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translateText } from '../utils/geminiUtils';

type Language = 'ar' | 'en';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (text: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Bidirectional dictionary: keyed by EITHER language value
// Each entry maps { ar, en } so we can look up from either side
const pairs: Array<[string, string]> = [
  // ── Navbar & general ──
  ['الرئيسية', 'Home'],
  ['المتجر', 'Shop'],
  ['الكويز', 'Quiz'],
  ['اتصل بنا', 'Contact Us'],
  ['المفضلة', 'Wishlist'],
  ['السلة', 'Cart'],
  ['حسابي', 'My Account'],
  ['تسجيل الدخول', 'Login'],
  ['تسجيل الخروج', 'Logout'],
  ['لوحة التحكم', 'Dashboard'],
  ['الملف الشخصي', 'Profile'],
  ['البحث', 'Search'],
  ['القائمة', 'Menu'],
  ['المقارنة', 'Compare'],
  ['مدونة', 'Blog'],
  ['اختبار العطور', 'Perfume Quiz'],
  ['استوديو الذكاء', 'AI Studio'],
  ['تغيير اللغة', 'Change Language'],

  // ── Hero section ──
  ['اكتشف عطرك', 'Discover Your'],
  ['المفضل الجديد', 'New Favorite'],
  ['نقدم لك تشكيلة فاخرة من العطور المستوحاة من أشهر الماركات العالمية، بثبات عالي وسعر مناسب.', 'We offer a premium collection of perfumes inspired by the world\'s most famous brands, with long-lasting power at an affordable price.'],
  ['تسوق المجموعة', 'Shop Collection'],

  // ── Categories section ──
  ['تسوق حسب الفئة', 'Shop by Category'],
  ['اختر ما يناسبك', 'Choose What Suits You'],
  ['مجموعات متنوعة تناسب كل الأذواق', 'Diverse collections for every taste'],
  ['نساء', 'Women'],
  ['رجال', 'Men'],
  ['عطور زهرية وأنيقة', 'Floral & Elegant Fragrances'],
  ['عطور خشبية وقوية', 'Woody & Bold Fragrances'],
  ['عطور عصرية ومنعشة', 'Modern & Fresh Fragrances'],

  // ── Catalog section ──
  ['كاتالوج Aura', 'Aura Catalog'],
  ['جميع العطور', 'All Perfumes'],
  ['تصفح مجموعتنا الكاملة من العطور الفاخرة المستوحاة من أشهر الماركات العالمية', 'Browse our complete collection of luxury perfumes inspired by the world\'s most famous brands'],
  ['عرض الكل', 'View All'],

  // ── FAQ section ──
  ['الأسئلة الشائعة', 'Frequently Asked Questions'],
  ['كل ما تحتاج معرفته عن عطور Aura.', 'Everything you need to know about Aura Perfumes.'],
  ['ما هي العطور المستوحاة؟', 'What are inspired perfumes?'],
  ['العطور المستوحاة هي عطور مُصنعة بمكونات عالية الجودة لتقديم رائحة مشابهة للعطور العالمية المشهورة بسعر مناسب. وهي ليست مقلدة بل تركيبات أصلية مستوحاة من الروائح الشهيرة.', 'Inspired perfumes are crafted with high-quality ingredients to deliver a scent similar to world-famous perfumes at an affordable price. They are not counterfeits but original formulations inspired by iconic fragrances.'],
  ['كم يدوم ثبات عطور Aura؟', 'How long do Aura perfumes last?'],
  ['عطورنا مُصنعة بتركيز عالي من الزيوت العطرية لضمان ثبات يدوم من 8 إلى 12 ساعة على البشرة، وأكثر على الملابس والأقمشة.', 'Our perfumes are made with a high concentration of fragrance oils, ensuring a lasting power of 8 to 12 hours on skin, and even longer on clothes and fabrics.'],
  ['هل تشحنون لجميع أنحاء الوطن العربي؟', 'Do you ship to all Arab countries?'],
  ['نعم! نوفر شحن سريع لجميع أنحاء مصر والوطن العربي مع خاصية تتبع الطلبات لضمان وصولها بأمان.', 'Yes! We offer fast shipping across Egypt and the Arab world with order tracking to ensure safe delivery.'],
  ['ما الأحجام المتاحة؟', 'What sizes are available?'],
  ['جميع عطورنا متوفرة بحجم 50ml و100ml. بعض العطور قد تتوفر أيضاً بأحجام سفر صغيرة.', 'All our perfumes are available in 50ml and 100ml sizes. Some perfumes may also be available in smaller travel sizes.'],
  ['هل هذه عطور أصلية؟', 'Are these original perfumes?'],
  ['عطور Aura هي عطور مستوحاة من العطور العالمية وليست العطور الأصلية نفسها. نحن غير مرتبطين بأي من العلامات التجارية الأصلية المذكورة. جميع العلامات التجارية ملك لأصحابها.', 'Aura perfumes are inspired by international fragrances and are not the original perfumes themselves. We are not affiliated with any of the original brands mentioned. All trademarks belong to their respective owners.'],

  // ── Shop & categories ──
  ['الكل', 'All'],
  ['رجالي', 'Men'],
  ['نسائي', 'Women'],
  ['للجنسين', 'Unisex'],
  ['عطور رجالية', "Men's Perfumes"],
  ['عطور نسائية', "Women's Perfumes"],
  ['عطور للجنسين', 'Unisex Perfumes'],
  ['بحث متقدم', 'Advanced Search'],
  ['بحث بالاسم...', 'Search by name...'],
  ['عطر مستوحى من', 'Inspired by'],
  ['عرض المزيد', 'Load More'],
  ['ابحث عن عطر أو ماركة...', 'Search for a perfume or brand...'],
  ['مستوحى من', 'Inspired by'],
  ['الحجم', 'Size'],
  ['متوفر', 'In Stock'],
  ['غير متوفر', 'Out of Stock'],
  ['أحدث المنتجات', 'New Arrivals'],
  ['الأكثر مبيعاً', 'Best Sellers'],
  ['ترتيب حسب', 'Sort by'],
  ['السعر: من الأقل للأعلى', 'Price: Low to High'],
  ['السعر: من الأعلى للأقل', 'Price: High to Low'],
  ['منتجات', 'products'],

  // ── Admin ──
  ['لوحة الإدارة', 'Admin Panel'],
  ['الطلبات', 'Orders'],
  ['المنتجات', 'Products'],
  ['الفئات', 'Categories'],
  ['العلامات التجارية', 'Brands'],
  ['المجموعات', 'Collections'],
  ['أطقم الهدايا', 'Gift Sets'],
  ['التقارير', 'Reports'],
  ['الكوبونات', 'Coupons'],
  ['التقييمات', 'Reviews'],
  ['العملاء', 'Customers'],
  ['المستخدمين', 'Users'],
  ['الإعدادات', 'Settings'],
  ['الأقسام', 'Sections'],
  ['السياسات', 'Policies'],
  ['الترجمات', 'Translations'],
  ['خريطة المقاسات', 'Size Mapping'],
  ['التنبيهات', 'Alerts'],
  ['التشخيصات', 'Diagnostics'],
  ['سجل التدقيق', 'Audit Logs'],
  ['رئيسي', 'Main'],
  ['الكتالوج', 'Catalog'],
  ['التسويق', 'Marketing'],
  ['النظام', 'System'],
  ['طي القائمة', 'Collapse Menu'],
  ['العودة للمتجر', 'Back to Store'],

  // ── Footer & pages ──
  ['عن أورا', 'About Aura'],
  ['سياسة الخصوصية', 'Privacy Policy'],
  ['الشروط والأحكام', 'Terms & Conditions'],
  ['سياسة الاسترجاع', 'Refund Policy'],
  ['من نحن', 'About Us'],
  ['تواصل معنا', 'Contact Us'],
  ['روابط سريعة', 'Quick Links'],
  ['مقارنة العطور بالأصلية', 'Compare with Originals'],
  ['أفضل عطور رجالي', 'Best Men\'s Perfumes'],
  ['عطور نسائية فاخرة', 'Luxury Women\'s Perfumes'],
  ['عطور هدايا', 'Gift Perfumes'],
  ['الصفحة غير موجودة', 'Page Not Found'],
  ['عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.', 'Sorry, the page you are looking for does not exist or has been moved.'],
  ['الصفحة الرئيسية', 'Home Page'],
  ['تصفح العطور', 'Browse Perfumes'],
  ['خدمة العملاء', 'Customer Service'],
  ['تابعنا', 'Follow Us'],
  ['جميع الحقوق محفوظة', 'All Rights Reserved'],
  ['صنع بحب في مصر', 'Made with Love in Egypt'],
  ['اشترك في نشرتنا البريدية', 'Subscribe to our newsletter'],
  ['ادخل بريدك الإلكتروني', 'Enter your email'],
  ['اشترك', 'Subscribe'],
  ['متجر عطور مستوحاة من أشهر الماركات العالمية بجودة عالية وثبات يدوم.', 'A perfume store inspired by the world\'s most famous brands, with high quality and lasting power.'],

  // ── Cart & Checkout ──
  ['أضف إلى السلة', 'Add to Cart'],
  ['إتمام الشراء', 'Checkout'],
  ['المجموع', 'Total'],
  ['الكمية', 'Quantity'],
  ['حذف', 'Delete'],
  ['متابعة التسوق', 'Continue Shopping'],
  ['سلة التسوق فارغة', 'Your cart is empty'],
  ['المجموع الفرعي', 'Subtotal'],
  ['الشحن', 'Shipping'],
  ['مجاناً', 'Free'],
  ['الإجمالي', 'Grand Total'],
  ['ملخص الطلب', 'Order Summary'],

  // ── Auth ──
  ['إنشاء حساب', 'Create Account'],
  ['تسجيل', 'Register'],
  ['البريد الإلكتروني', 'Email'],
  ['كلمة المرور', 'Password'],
  ['الاسم الكامل', 'Full Name'],
  ['ليس لديك حساب؟', "Don't have an account?"],
  ['سجل الآن', 'Register now'],
  ['العودة إلى', 'Back to'],
  ['أو تابع باستخدام', 'Or continue with'],
  ['نسيت كلمة المرور؟', 'Forgot your password?'],
  ['تسجيل الدخول باستخدام جوجل', 'Sign in with Google'],

  // ── Profile ──
  ['طلباتي', 'My Orders'],
  ['نشاطاتي', 'My Activities'],
  ['لا توجد طلبات سابقة حتى الآن.', 'No previous orders yet.'],
  ['تاريخ الانضمام', 'Joined'],
  ['حالة الحساب', 'Account Status'],
  ['نشط', 'Active'],

  // ── Product Details ──
  ['الوصف', 'Description'],
  ['المراجعات', 'Reviews'],
  ['أضف مراجعة', 'Add Review'],
  ['منتجات مشابهة', 'Similar Products'],
  ['مشاركة', 'Share'],
  ['أضف إلى المفضلة', 'Add to Wishlist'],
  ['أضف للمقارنة', 'Add to Compare'],

  // ── Contact ──
  ['الاسم', 'Name'],
  ['الرسالة', 'Message'],
  ['إرسال', 'Send'],
  ['رقم الهاتف', 'Phone Number'],
  ['العنوان', 'Address'],

  // ── Validation ──
  ['الاسم بالكامل', 'Full Name'],
  ['أدخل اسمك بالكامل...', 'Enter your full name...'],
  ['الاسم بالكامل مطلوب ويجب أن يكون 3 حروف على الأقل', 'Full name is required and must be at least 3 characters'],
  ['رقم الهاتف يجب أن يتكون من 11 رقم ويبدأ بـ 01', 'Phone number must be 11 digits and start with 01'],
  ['اسم المدينة يجب أن يكون حرفين على الأقل', 'City name must be at least 2 characters'],
  ['العنوان يجب أن يكون 10 حروف على الأقل', 'Address must be at least 10 characters'],
  
  // ── Checkout Form ──
  ['تواصل', 'Contact'],
  ['التوصيل', 'Delivery'],
  ['البلد/المنطقة', 'Country/Region'],
  ['مصر', 'Egypt'],
  ['الاسم الأول', 'First name'],
  ['اسم العائلة', 'Last name'],
  ['شقة، جناح، إلخ (اختياري)', 'Apartment, suite, etc. (optional)'],
  ['المحافظة', 'Governorate'],
  ['الرمز البريدي (اختياري)', 'Postal code (optional)'],
  ['حفظ هذه المعلومات للمرة القادمة', 'Save this information for next time'],
  ['طريقة الشحن', 'Shipping method'],
  ['توصيل (2-5 أيام عمل)', 'Delivery (2-5 working days)'],
  ['الاسم الأول مطلوب', 'First name is required'],
  ['اسم العائلة مطلوب', 'Last name is required'],
  ['البريد الإلكتروني غير صالح', 'Valid email is required'],
  ['العنوان مطلوب', 'Address is required'],

  // ── SEO ──
  ['عطور مستوحاة بجودة عالمية وثبات عالي', 'Inspired perfumes with world-class quality and lasting power'],
  ['Aura Perfumes — اكتشف تشكيلة فاخرة من العطور المستوحاة من أشهر الماركات العالمية. عطور رجالية ونسائية وللجنسين بجودة عالية وثبات يدوم وسعر مناسب. شحن سريع لمصر والوطن العربي.', 'Aura Perfumes — Discover a premium collection of perfumes inspired by the world\'s most famous brands. Men\'s, women\'s, and unisex perfumes with high quality, long-lasting power, and affordable prices. Fast shipping to Egypt and the Arab world.'],
  ['عطور, عطور مستوحاة, عطور رجالية, عطور نسائية, عطور للجنسين, Aura Perfumes, عطور فاخرة, عطور مصر, inspired perfumes, كريد أفينتوس, باكارا روج, شانيل', 'Perfumes, inspired perfumes, men\'s perfumes, women\'s perfumes, unisex perfumes, Aura Perfumes, luxury perfumes, Egypt perfumes, inspired perfumes, Creed Aventus, Baccarat Rouge, Chanel'],
  ['عطور, عطور مستوحاة, عطور رجالية, عطور نسائية, عطور للجنسين, Aura Perfumes, عطور فاخرة, عطور مصر, inspired perfumes, كريد أفينتوس, باكارا روج, شانيل, fragrances, fragrance, scents, scent, luxury fragrances, aura fragrances, برفانات, برفيوز, برفيومز, محاكاه, ريحه, برفان تركيب, برفان, برفيوم, برفيوم محاكاه, دار محاكاه, دور محاكاه, اورا, اورا للبرفانات, اورا برفيوم, اورا برفيومز, هاله, عطور تركيب, برفان رجالي, برفانات حريمي, عطور كوبي, ريحة ثابته, احسن برفان, برفانات اوريجنال', 'Perfumes, inspired perfumes, men\'s perfumes, women\'s perfumes, unisex perfumes, Aura Perfumes, luxury perfumes, Egypt perfumes, inspired perfumes, Creed Aventus, Baccarat Rouge, Chanel, fragrances, fragrance, scents, scent, luxury fragrances, aura fragrances, perfumes, parfums, perfums, simulation, scent, custom perfume, parfum, perfume, perfume simulation, simulation house, simulation houses, Aura, Aura for perfumes, Aura perfume, Aura perfumes, Halo, custom perfumes, men\'s perfume, women\'s perfume, copy perfumes, long-lasting scent, best perfume, original perfumes'],
  ['مدونة عطور, نصائح عطور, أفضل عطور, عطور مصر, اختيار العطر المناسب, مراجعات عطور, ريفيوهات برفانات, احسن برفان', 'Perfume blog, perfume tips, best perfumes, Egypt perfumes, choosing the right perfume, perfume reviews, perfume reviews, best perfume'],
  ['اختبار عطر, اختبار العطر المثالي, quiz عطور, اختيار عطر, Aura Perfumes quiz, توصيات عطور, ازاى اختار برفان, احسن ريحة ليا', 'Perfume quiz, perfect perfume quiz, perfume quiz, choosing a perfume, Aura Perfumes quiz, perfume recommendations, how to choose perfume, best scent for me'],
  ['اتصل بنا, خدمة عملاء أورا للعطور, ارقام التواصل أورا', 'Contact us, Aura Perfumes customer service, Aura contact numbers'],
  ['مقارنة عطور, مقارنة عطور مستوحاة, Aura Perfumes', 'Perfume comparison, inspired perfume comparison, Aura Perfumes'],
  ['من نحن أورا للعطور, قصة أورا, جودة العطور, عطور مستوحاة', 'About Aura Perfumes, Aura story, perfume quality, inspired perfumes'],

  // ── Misc ──
  ['ج.م', 'EGP'],
  ['قطعة', 'piece'],
  ['تفاصيل', 'Details'],
  ['إغلاق', 'Close'],
  ['تأكيد', 'Confirm'],
  ['إلغاء', 'Cancel'],
  ['حفظ', 'Save'],
  ['تعديل', 'Edit'],
  ['مسح', 'Clear'],
  ['نتائج', 'Results'],
  ['لا توجد نتائج', 'No results found'],
  ['جاري التحميل...', 'Loading...'],
  ['خطأ', 'Error'],
  ['نجاح', 'Success'],
];

// Build lookup maps for O(1) access in both directions
const arToEn: Record<string, string> = {};
const enToAr: Record<string, string> = {};
for (const [ar, en] of pairs) {
  arToEn[ar] = en;
  enToAr[en] = ar;
}

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'ar';
  });
  
  // Cache for dynamic translations using Gemini
  const [cache, setCache] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('translationCache');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (text: string): string => {
    if (!text) return '';

    // If target language is Arabic
    if (language === 'ar') {
      // If the text is already Arabic (from the source code), return as-is
      if (arToEn[text]) return text;
      // If the text is English, look up its Arabic equivalent
      if (enToAr[text]) return enToAr[text];
      // Otherwise return as-is (Arabic source code text not in dictionary)
      return text;
    }

    // If target language is English
    // If the text is Arabic, look up its English equivalent
    if (arToEn[text]) return arToEn[text];
    // If the text is already English, return as-is
    if (enToAr[text]) return text;

    // Check dynamic cache
    const cacheKey = `${text}_${language}`;
    if (cache[cacheKey]) {
      return cache[cacheKey];
    }

    // Call Gemini to translate and update cache lazily
    setTimeout(async () => {
      if (cache[cacheKey] || localStorage.getItem(`fetching_${cacheKey}`)) return;
      localStorage.setItem(`fetching_${cacheKey}`, 'true');

      try {
        const translated = await translateText(text, language);
        setCache(prev => {
          const newCache = { ...prev, [cacheKey]: translated };
          localStorage.setItem('translationCache', JSON.stringify(newCache));
          return newCache;
        });
      } catch (e) {
        console.error('Failed to translate:', text);
      } finally {
        localStorage.removeItem(`fetching_${cacheKey}`);
      }
    }, 0);

    return text;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
