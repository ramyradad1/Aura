/**
 * SEO Automation Cron Job for Aura Perfumes
 * ─────────────────────────────────────────
 * Runs daily at 3:00 AM to auto-generate SEO metadata for perfume products.
 * 
 * Features:
 * - Fetches products missing SEO data from Firestore (batch of 10)
 * - Calls Gemini AI to generate: meta title, meta description, FAQ, JSON-LD schema
 * - Updates products in Firestore with generated SEO data
 * - Retry logic with exponential backoff on API failures
 * - Full error logging
 * 
 * Usage:
 *   npx tsx scripts/seo-cron.ts          # Run once manually
 *   npx tsx scripts/seo-cron.ts --cron   # Start the scheduler (runs daily at 3 AM)
 * 
 * Deploy:
 *   Add to your server startup or use PM2:
 *   pm2 start "npx tsx scripts/seo-cron.ts --cron" --name seo-cron
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, getDocs, doc, updateDoc,
  query, limit
} from 'firebase/firestore';
import { GoogleGenAI, Type } from '@google/genai';
import { Cron } from 'croner';

// ─── Firebase Config ───────────────────────────────────────────────────────────
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig, 'seo-cron');
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// ─── Gemini API Config ─────────────────────────────────────────────────────────
const GEMINI_KEYS = [
  "QUl6YVN5Q3ZZSXlXM3A3c1V3QkdpR1JiYXpvUjVUcnlfSTlZSDdF",
  "QUl6YVN5RGI5cHprS2ttZThHT0lOeUItTXlPSUF5UWc5QXpiS2N3",
  "QUl6YVN5QmZFelpJV1NQdi1NbFp6MHJQRF9mbXRZSTZXcC0wRXZR"
];

function getAi(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || atob(GEMINI_KEYS[Math.floor(Math.random() * GEMINI_KEYS.length)]);
  return new GoogleGenAI({ apiKey });
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 5000; // 5s, 10s, 20s exponential backoff

// ─── Logging ───────────────────────────────────────────────────────────────────
function log(level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS', message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const prefix = { INFO: 'ℹ️', WARN: '⚠️', ERROR: '❌', SUCCESS: '✅' }[level];
  console.log(`[${timestamp}] ${prefix} [${level}] ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

// ─── Interfaces ────────────────────────────────────────────────────────────────
interface PerfumeProduct {
  id: string;
  name: string;
  inspiredBy?: string;
  category?: string;
  price?: number;
  notes?: { top?: string; middle?: string; base?: string };
  description?: string;
  seoOptimizedAt?: any;
  seoMeta?: any;
}

interface SEOGeneratedData {
  metaTitleAr: string;
  metaTitleEn: string;
  metaDescAr: string;
  metaDescEn: string;
  faq: Array<{ question: string; answer: string }>;
  jsonLdSchema: string;
  keywordsAr: string;
  keywordsEn: string;
}

// ─── Step 1: Fetch Products Needing SEO ────────────────────────────────────────
async function fetchProductsNeedingSEO(): Promise<PerfumeProduct[]> {
  log('INFO', `Fetching up to ${BATCH_SIZE} products needing SEO optimization...`);

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Firestore can't query for missing fields, so fetch all and filter in-memory
    const allQuery = query(collection(db, 'perfumes'), limit(50));
    const snapshot = await getDocs(allQuery);

    const products: PerfumeProduct[] = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as any;

      // Include product if: no seoOptimizedAt at all, or it's older than 30 days
      if (data.seoOptimizedAt) {
        const optimizedDate = data.seoOptimizedAt.toDate
          ? data.seoOptimizedAt.toDate()
          : new Date(data.seoOptimizedAt);
        if (optimizedDate > thirtyDaysAgo) continue; // recently optimized, skip
      }

      products.push({ id: docSnap.id, ...data });
      if (products.length >= BATCH_SIZE) break;
    }

    log('INFO', `Found ${products.length} products to optimize.`);
    return products;
  } catch (error: any) {
    log('ERROR', `Failed to fetch products: ${error.message}`);
    throw error;
  }
}

// ─── Step 2: Generate SEO with Gemini AI ───────────────────────────────────────
async function generateSEOForProduct(product: PerfumeProduct): Promise<SEOGeneratedData> {
  const ai = getAi();

  const categoryAr = product.category === 'men' ? 'رجالي' : product.category === 'women' ? 'نسائي' : 'للجنسين';
  const notesStr = product.notes
    ? `النوتات الافتتاحية: ${product.notes.top || 'غير محدد'}, نوتات القلب: ${product.notes.middle || 'غير محدد'}, النوتات القاعدية: ${product.notes.base || 'غير محدد'}`
    : 'غير متوفر';

  const prompt = `
    أنت خبير SEO متخصص في التجارة الإلكترونية المصرية ومتجر عطور مستوحاة اسمه "Aura Perfumes".
    
    بيانات المنتج:
    - الاسم: ${product.name}
    - مستوحى من: ${product.inspiredBy || 'غير محدد'}
    - الفئة: ${categoryAr}
    - السعر: ${product.price || 0} جنيه مصري (EGP)
    - النوتات: ${notesStr}
    - الوصف الحالي: ${product.description || 'لا يوجد'}
    
    المطلوب توليده:

    1. **metaTitleAr**: عنوان SEO بالعربي (أقل من 60 حرف) — يستخدم كلمات مصرية مثل: برفان أصلي, ثبات عالي, فوحان, عطر صيفي/شتوي
    2. **metaTitleEn**: عنوان SEO بالإنجليزي (أقل من 60 حرف)
    3. **metaDescAr**: وصف ميتا بالعربي (أقل من 160 حرف) — يشمل call to action ويستهدف البحث المصري
    4. **metaDescEn**: وصف ميتا بالإنجليزي (أقل من 160 حرف)
    5. **faq**: مصفوفة من 2-3 أسئلة شائعة عن العطر ده بالذات — مكتوبة بالعربي لتظهر في Google AI Overviews و Rich Snippets
       - كل سؤال يكون واقعي ومفيد (مثل: "كام ساعة ثبات العطر ده؟", "العطر ده يشبه إيه؟")
    6. **jsonLdSchema**: كود JSON-LD صالح لـ Schema.org من نوع Product — بالجنيه المصري (EGP)
       - يشمل: name, description, image placeholder, brand (Aura Perfumes), offers (price, priceCurrency: EGP, availability: InStock)
    7. **keywordsAr**: كلمات مفتاحية بالعربي مفصولة بفواصل تستهدف السوق المصري
    8. **keywordsEn**: كلمات مفتاحية بالإنجليزي مفصولة بفواصل
    
    ملاحظات مهمة:
    - الأسلوب يكون مصري مفهوم وجذاب
    - الـ JSON-LD يكون string قابلة للـ parse كـ JSON صالح
    - الـ FAQ تكون مفيدة فعلاً للعميل المصري
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metaTitleAr: { type: Type.STRING },
          metaTitleEn: { type: Type.STRING },
          metaDescAr: { type: Type.STRING },
          metaDescEn: { type: Type.STRING },
          faq: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ["question", "answer"]
            }
          },
          jsonLdSchema: { type: Type.STRING },
          keywordsAr: { type: Type.STRING },
          keywordsEn: { type: Type.STRING }
        },
        required: ["metaTitleAr", "metaTitleEn", "metaDescAr", "metaDescEn", "faq", "jsonLdSchema", "keywordsAr", "keywordsEn"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
}

// ─── Step 3: Update Product in Firestore ───────────────────────────────────────
async function updateProductSEO(productId: string, seoData: SEOGeneratedData): Promise<void> {
  const productRef = doc(db, 'perfumes', productId);

  await updateDoc(productRef, {
    seoMeta: {
      titleAr: seoData.metaTitleAr,
      titleEn: seoData.metaTitleEn,
      descAr: seoData.metaDescAr,
      descEn: seoData.metaDescEn,
      keywordsAr: seoData.keywordsAr,
      keywordsEn: seoData.keywordsEn,
      faq: seoData.faq,
      jsonLdSchema: seoData.jsonLdSchema,
    },
    seoOptimizedAt: new Date().toISOString(),
  });
}

// ─── Retry Wrapper ─────────────────────────────────────────────────────────────
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
      log('WARN', `[Attempt ${attempt}/${MAX_RETRIES}] ${label} failed: ${error.message}. Retrying in ${delay / 1000}s...`);

      if (attempt === MAX_RETRIES) {
        log('ERROR', `${label} failed after ${MAX_RETRIES} attempts. Skipping.`);
        return null;
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
}

// ─── Main Job ──────────────────────────────────────────────────────────────────
async function runSEOOptimizationJob(): Promise<void> {
  const startTime = Date.now();
  log('INFO', '═══════════════════════════════════════════════════════════');
  log('INFO', '🚀 Starting SEO Optimization Job...');
  log('INFO', '═══════════════════════════════════════════════════════════');

  let successCount = 0;
  let failCount = 0;

  try {
    // Step 1: Fetch products
    const products = await fetchProductsNeedingSEO();

    if (products.length === 0) {
      log('SUCCESS', 'All products are already optimized! Nothing to do.');
      return;
    }

    // Step 2 & 3: Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      log('INFO', `━━━ [${i + 1}/${products.length}] Processing: "${product.name}" (ID: ${product.id}) ━━━`);

      // Generate SEO data with retry
      const seoData = await withRetry(
        () => generateSEOForProduct(product),
        `Gemini AI for "${product.name}"`
      );

      if (!seoData) {
        failCount++;
        continue;
      }

      log('INFO', `Generated SEO for "${product.name}":`);
      log('INFO', `  📌 Title AR: ${seoData.metaTitleAr}`);
      log('INFO', `  📌 Title EN: ${seoData.metaTitleEn}`);
      log('INFO', `  📌 FAQ: ${seoData.faq.length} questions`);

      // Update Firestore with retry
      const updated = await withRetry(
        () => updateProductSEO(product.id, seoData),
        `Firestore update for "${product.name}"`
      );

      if (updated !== null) {
        successCount++;
        log('SUCCESS', `"${product.name}" — SEO updated in Firestore ✅`);
      } else {
        failCount++;
      }

      // Rate limit: wait 2 seconds between API calls
      if (i < products.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } catch (error: any) {
    log('ERROR', `Job crashed: ${error.message}`);
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  log('INFO', '═══════════════════════════════════════════════════════════');
  log('SUCCESS', `Job complete in ${elapsed}s — ✅ ${successCount} updated, ❌ ${failCount} failed`);
  log('INFO', '═══════════════════════════════════════════════════════════');
}

// ─── Entry Point ───────────────────────────────────────────────────────────────
const isCronMode = process.argv.includes('--cron');

if (isCronMode) {
  log('INFO', '🕐 SEO Cron Scheduler started. Job will run daily at 3:00 AM Egypt time (UTC+2).');
  log('INFO', '   Stop with Ctrl+C or kill the process.');

  // Croner supports timezone-aware cron expressions
  // "0 3 * * *" = every day at 3:00 AM
  const job = new Cron('0 3 * * *', { timezone: 'Africa/Cairo' }, async () => {
    log('INFO', '⏰ Scheduled trigger — starting SEO optimization job...');
    await runSEOOptimizationJob();
  });

  log('INFO', `Next run scheduled at: ${job.nextRun()?.toLocaleString('en-EG', { timeZone: 'Africa/Cairo' })}`);

  // Keep the process alive
  process.on('SIGINT', () => {
    log('INFO', '🛑 Cron scheduler stopped.');
    job.stop();
    process.exit(0);
  });

} else {
  // One-time manual run
  log('INFO', '🔧 Running SEO optimization manually (one-time)...');
  runSEOOptimizationJob().then(() => {
    log('INFO', '🏁 Manual run finished. Exiting.');
    process.exit(0);
  });
}
