/**
 * Google Merchant Center Product Feed Generator
 *
 * Generates a Google-compatible product feed (XML/RSS) for Google Shopping.
 * Run: `tsx scripts/generate-product-feed.ts`
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

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

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function generateProductFeed() {
  console.log('🛒 Generating Google Merchant Center product feed...');

  let products: any[] = [];
  try {
    const snapshot = await getDocs(collection(db, 'perfumes'));
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log(`   Found ${products.length} products`);
  } catch (err) {
    console.warn('   ⚠️  Could not fetch products, generating empty feed');
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
<title>Aura Perfumes — منتجات العطور</title>
<link>${SITE_URL}</link>
<description>تشكيلة فاخرة من العطور المستوحاة من أشهر الماركات العالمية</description>`;

  for (const product of products) {
    const name = escapeXml(product.name || '');
    const description = escapeXml(product.description || `عطر مستوحى من ${product.inspiredBy || ''}`);
    const categoryLabel = product.category === 'men' ? 'عطور رجالية' : product.category === 'women' ? 'عطور نسائية' : 'عطور للجنسين';

    xml += `
<item>
  <g:id>AURA-${product.id}</g:id>
  <g:title>${name}</g:title>
  <g:description>${description}</g:description>
  <g:link>${SITE_URL}/perfume/${product.id}</g:link>
  <g:image_link>${escapeXml(product.imageUrl || '')}</g:image_link>
  <g:price>${product.price || 0} EGP</g:price>
  <g:availability>in_stock</g:availability>
  <g:condition>new</g:condition>
  <g:brand>Aura Perfumes</g:brand>
  <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>
  <g:product_type>${escapeXml(categoryLabel)}</g:product_type>
  <g:shipping>
    <g:country>EG</g:country>
    <g:price>50 EGP</g:price>
  </g:shipping>
</item>`;
  }

  xml += `
</channel>
</rss>
`;

  const outputPath = resolve(process.cwd(), 'public', 'product-feed.xml');
  writeFileSync(outputPath, xml, 'utf-8');
  console.log(`✅ Product feed generated: ${outputPath} (${products.length} products)`);
  process.exit(0);
}

generateProductFeed().catch(err => {
  console.error('❌ Product feed generation failed:', err);
  process.exit(1);
});
