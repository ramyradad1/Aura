/**
 * Post-build SEO Pre-render Script
 * 
 * Generates static HTML files for each route with correct:
 * - <title>, <meta description>, <link rel="canonical">
 * - <h1> tag for content
 * - Open Graph & hreflang tags
 * 
 * This ensures crawlers (Ahrefs, Google) see proper SEO metadata
 * without needing JavaScript rendering.
 * 
 * Run after `vite build`: `tsx scripts/generate-seo-pages.ts`
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const SITE_URL = 'https://www.aura-perfumes.online';
const SITE_NAME = 'Aura Perfumes';

interface PageMeta {
  path: string;
  title: string;
  description: string;
  h1: string;
  keywords?: string;
}

const PAGES: PageMeta[] = [
  {
    path: '/',
    title: `${SITE_NAME} | عطور مستوحاة بجودة عالمية وثبات عالي`,
    description: 'Aura Perfumes — متجر عطور مستوحاة من أشهر الماركات العالمية بجودة عالية وثبات يدوم. عطور رجالية ونسائية بأسعار مناسبة وشحن سريع لمصر.',
    h1: 'أورا بيرفيومز — عطور مستوحاة بجودة عالمية',
    keywords: 'عطور, عطور مستوحاة, عطور رجالية, عطور نسائية, Aura Perfumes, عطور مصر',
  },
  {
    path: '/shop/all',
    title: `جميع العطور | ${SITE_NAME}`,
    description: 'تسوق جميع العطور المستوحاة من أشهر الماركات العالمية. عطور رجالية ونسائية وللجنسين بجودة عالية وثبات يدوم.',
    h1: 'جميع العطور',
    keywords: 'عطور مستوحاة, جميع العطور, Aura Perfumes',
  },
  {
    path: '/shop/men',
    title: `عطور رجالية | ${SITE_NAME}`,
    description: 'اكتشف أفضل العطور الرجالية المستوحاة من أشهر الماركات العالمية. ثبات عالي وأسعار مناسبة.',
    h1: 'عطور رجالية',
    keywords: 'عطور رجالية, عطور رجالي مستوحاة, Aura Perfumes رجالي',
  },
  {
    path: '/shop/women',
    title: `عطور نسائية | ${SITE_NAME}`,
    description: 'اكتشفي أجمل العطور النسائية المستوحاة من أشهر الماركات العالمية. روائح فاخرة بأسعار مناسبة.',
    h1: 'عطور نسائية',
    keywords: 'عطور نسائية, عطور نسائي مستوحاة, Aura Perfumes نسائي',
  },
  {
    path: '/shop/unisex',
    title: `عطور للجنسين | ${SITE_NAME}`,
    description: 'عطور للجنسين مستوحاة من أشهر الماركات العالمية. روائح مميزة تناسب الجميع.',
    h1: 'عطور للجنسين',
    keywords: 'عطور للجنسين, عطور يونيسيكس, Aura Perfumes يونيسيكس',
  },
  {
    path: '/about',
    title: `من نحن | ${SITE_NAME}`,
    description: 'تعرف على أورا للعطور، وجهتك الأولى لاكتشاف العطور المستوحاة بجودة عالمية وثبات لا يضاهى.',
    h1: 'من نحن',
  },
  {
    path: '/contact',
    title: `اتصل بنا | ${SITE_NAME}`,
    description: 'تواصل مع خدمة عملاء أورا للعطور لأي استفسار أو مساعدة. نحن هنا لخدمتكم.',
    h1: 'اتصل بنا',
  },
  {
    path: '/blog',
    title: `المدونة | ${SITE_NAME}`,
    description: 'مدونة Aura Perfumes — مقالات ونصائح حول اختيار العطور وأفضل العطور الرجالية والنسائية في مصر.',
    h1: 'مدونة أورا للعطور',
    keywords: 'مدونة عطور, نصائح عطور, أفضل عطور',
  },
  {
    path: '/quiz',
    title: `اختبار العطور | ${SITE_NAME}`,
    description: 'اكتشف عطرك المثالي من خلال اختبار العطور الذكي. أجب على بعض الأسئلة واحصل على توصيات مخصصة.',
    h1: 'اختبار العطور',
  },
  {
    path: '/compare',
    title: `مقارنة العطور | ${SITE_NAME}`,
    description: 'قارن بين عطور Aura Perfumes المستوحاة جنبًا إلى جنب. قارن النوتات والأسعار والفئات.',
    h1: 'مقارنة العطور',
  },
  {
    path: '/ai-studio',
    title: `ستوديو الذكاء الاصطناعي | ${SITE_NAME}`,
    description: 'استخدم الذكاء الاصطناعي لاكتشاف العطور المناسبة لك. توصيات مخصصة بناءً على تفضيلاتك.',
    h1: 'ستوديو الذكاء الاصطناعي',
  },
  {
    path: '/privacy',
    title: `سياسة الخصوصية | ${SITE_NAME}`,
    description: 'تعرف على سياسة الخصوصية وكيفية حماية بياناتك الشخصية في متجر أورا للعطور.',
    h1: 'سياسة الخصوصية',
  },
  {
    path: '/terms',
    title: `الشروط والأحكام | ${SITE_NAME}`,
    description: 'اقرأ الشروط والأحكام الخاصة بشراء العطور واستخدام موقع أورا للعطور.',
    h1: 'الشروط والأحكام',
  },
  {
    path: '/refund',
    title: `سياسة الاسترجاع | ${SITE_NAME}`,
    description: 'تعرف على سياسة الاسترجاع والاستبدال لمنتجات أورا للعطور.',
    h1: 'سياسة الاسترجاع',
  },
  {
    path: '/عطور-رجالي-مصر',
    title: `أفضل عطور رجالي في مصر 2025 — عطور مستوحاة فاخرة | ${SITE_NAME}`,
    description: 'اكتشف أفضل العطور الرجالية المستوحاة من Creed Aventus و Bleu de Chanel في مصر. عطور فاخرة بثبات 8-12 ساعة وأسعار تبدأ من 85 ج.م.',
    h1: 'أفضل عطور رجالي في مصر',
    keywords: 'عطور رجالي مصر, أفضل عطور رجالية 2025, عطر كريد أفينتوس مصر',
  },
  {
    path: '/عطور-نسائية-فاخرة',
    title: `أجمل عطور نسائية فاخرة في مصر 2025 | ${SITE_NAME}`,
    description: 'اكتشفي أجمل العطور النسائية المستوحاة من Baccarat Rouge 540 و Chanel No. 5 في مصر. عطور فاخرة للعرايس بأسعار تبدأ من 95 ج.م.',
    h1: 'أجمل عطور نسائية فاخرة',
    keywords: 'عطور نسائية فاخرة مصر, عطور عرايس, عطر باكارا روج',
  },
  {
    path: '/عطور-هدايا',
    title: `أفضل عطور هدايا في مصر 2025 | ${SITE_NAME}`,
    description: 'اكتشف أفضل العطور المناسبة كهدايا في مصر. عطور هدايا رجالي وعطور عرايس بتغليف فاخر. أسعار تبدأ من 85 ج.م وشحن سريع.',
    h1: 'أفضل عطور هدايا في مصر',
    keywords: 'عطور هدايا, عطور عرايس مصر, هدية عطر فاخر',
  },
  {
    path: '/مقارنة-العطور',
    title: `مقارنة العطور المستوحاة بالأصلية | ${SITE_NAME}`,
    description: 'مقارنة تفصيلية بين عطور Aura المستوحاة والعطور الأصلية. تعرف على الفرق في الثبات والرائحة والسعر.',
    h1: 'مقارنة العطور المستوحاة بالأصلية',
    keywords: 'مقارنة عطور, عطور مستوحاة مقابل أصلية, Aura Noir vs Creed Aventus',
  },
];

function generatePageHtml(template: string, page: PageMeta): string {
  const canonical = `${SITE_URL}${page.path === '/' ? '/' : page.path}`;
  
  let html = template;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${page.title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${page.description}"`
  );

  // Replace canonical
  html = html.replace(
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="${canonical}"`
  );

  // Replace OG tags
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="${canonical}"`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${page.title}"`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${page.description}"`
  );

  // Replace hreflang
  html = html.replace(
    /<link rel="alternate" hreflang="ar-EG" href="[^"]*"/,
    `<link rel="alternate" hreflang="ar-EG" href="${canonical}"`
  );
  html = html.replace(
    /<link rel="alternate" hreflang="ar" href="[^"]*"/,
    `<link rel="alternate" hreflang="ar" href="${canonical}"`
  );
  html = html.replace(
    /<link rel="alternate" hreflang="x-default" href="[^"]*"/,
    `<link rel="alternate" hreflang="x-default" href="${canonical}"`
  );

  // Replace twitter tags
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${page.title}"`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${page.description}"`
  );

  // Add keywords meta tag if provided (after description)
  if (page.keywords) {
    html = html.replace(
      /<meta name="keywords" content="[^"]*"/,
      `<meta name="keywords" content="${page.keywords}"`
    );
  }

  // Create an internal links navigation block for crawlers
  const navLinksHtml = PAGES.map(p => 
    `<a href="${p.path === '/' ? '/' : p.path}">${p.title}</a>`
  ).join(' | ');

  // Inject an <h1> tag and <nav> block inside <div id="root"> for crawlers
  // This visually hides the elements but allows HTML-only crawlers to discover all pages
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"><div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">
        <h1>${page.h1}</h1>
        <nav aria-label="Site Navigation">${navLinksHtml}</nav>
      </div></div>`
  );

  return html;
}

async function generateSEOPages() {
  console.log('🔍 Generating SEO-optimized HTML pages...');

  const distDir = resolve(process.cwd(), 'dist');
  const templatePath = resolve(distDir, 'index.html');

  if (!existsSync(templatePath)) {
    console.error('❌ dist/index.html not found. Run `vite build` first.');
    process.exit(1);
  }

  const template = readFileSync(templatePath, 'utf-8');
  let generated = 0;

  for (const page of PAGES) {
    if (page.path === '/') continue; // Skip root, it already uses the main index.html

    const pagePath = page.path.startsWith('/') ? page.path.slice(1) : page.path;
    const outputDir = resolve(distDir, pagePath);
    const outputFile = resolve(outputDir, 'index.html');

    // Create directory
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Generate and write HTML
    const html = generatePageHtml(template, page);
    writeFileSync(outputFile, html, 'utf-8');
    generated++;
  }

  // Also update the root index.html with home page meta
  const homePage = PAGES.find(p => p.path === '/');
  if (homePage) {
    const homeHtml = generatePageHtml(template, homePage);
    writeFileSync(templatePath, homeHtml, 'utf-8');
  }

  console.log(`✅ Generated ${generated} SEO pages in dist/`);
  process.exit(0);
}

generateSEOPages().catch(err => {
  console.error('❌ SEO page generation failed:', err);
  process.exit(1);
});
