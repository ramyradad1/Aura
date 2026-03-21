import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Note: Ensure the function slugUtils logic is replicated or imported if available in Node.
// But since we can't easily import a .ts file from src/ inside an api/ function without a build step 
// (Vercel builds api/ separately), we'll implement a simple slug generator inline to match `slugUtils.ts`.

const generateSlug = (name: string, id: string): string => {
  const safeName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `${safeName}-${id}`;
};

const SITE_URL = 'https://www.aura-perfumes.online';

const firebaseConfig = {
  projectId: 'gen-lang-client-0122523488',
  appId: '1:855051927733:web:b529ce82f7d44f71f07efc',
  apiKey: 'AIzaSyDh0SNxRrcd3btOxgfIDnX8Uzf5YRsurTo',
  authDomain: 'gen-lang-client-0122523488.firebaseapp.com',
  storageBucket: 'gen-lang-client-0122523488.firebasestorage.app',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-59a2416c-b76e-42b3-aa2f-20bea9c00712');

const STATIC_PAGES = [
  { path: '/',           priority: '1.0', changefreq: 'weekly' },
  { path: '/shop/all',   priority: '0.9', changefreq: 'daily' },
  { path: '/shop/men',   priority: '0.9', changefreq: 'daily' },
  { path: '/shop/women', priority: '0.9', changefreq: 'daily' },
  { path: '/shop/unisex',priority: '0.9', changefreq: 'daily' },
  { path: '/blog',        priority: '0.8', changefreq: 'weekly' },
  { path: '/blog/افضل-عطور-رجالي-2025',        priority: '0.7', changefreq: 'weekly' },
  { path: '/blog/دليل-اختيار-العطر-المناسب',   priority: '0.7', changefreq: 'weekly' },
  { path: '/blog/عطور-نسائية-فاخرة-2025',      priority: '0.7', changefreq: 'weekly' },
  { path: '/blog/افضل-عطور-صيف-2025',           priority: '0.7', changefreq: 'weekly' },
  { path: '/blog/عطور-مناسبات-وافراح-مصر',      priority: '0.7', changefreq: 'weekly' },
  { path: '/ai-studio',  priority: '0.7', changefreq: 'monthly' },
  { path: '/quiz',        priority: '0.7', changefreq: 'monthly' },
  { path: '/compare',     priority: '0.5', changefreq: 'monthly' },
  { path: '/about',       priority: '0.6', changefreq: 'monthly' },
  { path: '/contact',     priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy',     priority: '0.3', changefreq: 'yearly' },
  { path: '/terms',       priority: '0.3', changefreq: 'yearly' },
  { path: '/refund',      priority: '0.3', changefreq: 'yearly' },
  { path: '/عطور-رجالي-مصر',  priority: '0.8', changefreq: 'weekly' },
  { path: '/عطور-نسائية-فاخرة', priority: '0.8', changefreq: 'weekly' },
  { path: '/عطور-هدايا',      priority: '0.8', changefreq: 'weekly' },
  { path: '/مقارنة-العطور',    priority: '0.8', changefreq: 'weekly' },
];

function formatDate(date: any): string {
  if (date?.toDate) return date.toDate().toISOString().split('T')[0];
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return new Date().toISOString().split('T')[0];
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const today = new Date().toISOString().split('T')[0];
    let products: any[] = [];
    
    try {
      const snapshot = await getDocs(collection(db, 'perfumes'));
      products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Failed to fetch from Firestore', err);
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- ========== Static Pages ========== -->`;

    for (const page of STATIC_PAGES) {
      xml += `
  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <xhtml:link rel="alternate" hreflang="ar-EG" href="${SITE_URL}${page.path}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}${page.path}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${page.path}" />
  </url>`;
    }

    if (products.length > 0) {
      xml += `\n\n  <!-- ========== Product Pages (${products.length} products) ========== -->`;

      for (const product of products) {
        const lastmod = formatDate(product.updatedAt || product.seoOptimizedAt || product.createdAt);
        const name = escapeXml(product.name || '');
        const slug = generateSlug(product.name || '', product.id);

        xml += `
  <url>
    <loc>${SITE_URL}/perfume/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="ar-EG" href="${SITE_URL}/perfume/${slug}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}/perfume/${slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/perfume/${slug}" />`;

        if (product.imageUrl) {
          xml += `
    <image:image>
      <image:loc>${escapeXml(product.imageUrl)}</image:loc>
      <image:title>${name}</image:title>
      <image:caption>عطر ${name} من Aura Perfumes${product.inspiredBy ? ` — مستوحى من ${escapeXml(product.inspiredBy)}` : ''}</image:caption>
    </image:image>`;
        }
        xml += `\n  </url>`;
      }
    }

    xml += `\n</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400'); // Cache for 1 day
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).json({ error: 'Failed to generate sitemap' });
  }
}
