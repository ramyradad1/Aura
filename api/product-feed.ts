import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'gen-lang-client-0122523488',
  appId: '1:855051927733:web:b529ce82f7d44f71f07efc',
  apiKey: 'AIzaSyDh0SNxRrcd3btOxgfIDnX8Uzf5YRsurTo',
  authDomain: 'gen-lang-client-0122523488.firebaseapp.com',
  storageBucket: 'gen-lang-client-0122523488.firebasestorage.app',
};

const app = initializeApp(firebaseConfig, 'product-feed');
const db = getFirestore(app, 'ai-studio-59a2416c-b76e-42b3-aa2f-20bea9c00712');

const SITE_URL = 'https://www.aura-perfumes.online';

const generateSlug = (name: string, id: string): string => {
  const safeName = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return `${safeName}-${id}`;
};

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    let products: any[] = [];

    try {
      const snapshot = await getDocs(collection(db, 'perfumes'));
      products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Failed to fetch from Firestore', err);
    }

    if (products.length === 0) {
      res.status(200).setHeader('Content-Type', 'text/xml').send('<?xml version="1.0" encoding="UTF-8"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0"></feed>');
      return;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Aura Perfumes — عطور مستوحاة فاخرة</title>
  <link>${SITE_URL}</link>
  <description>متجر عطور مستوحاة من أشهر الماركات العالمية بجودة عالية وثبات يدوم</description>
`;

    for (const product of products) {
      const name = escapeXml(product.name || '');
      const slug = generateSlug(product.name || '', product.id);
      const description = escapeXml(product.description || `عطر ${product.name} مستوحى من ${product.inspiredBy || ''}`);
      const category = product.category === 'men' ? 'عطور رجالية' : product.category === 'women' ? 'عطور نسائية' : 'عطور للجنسين';
      const price = product.price || 0;
      const imageUrl = product.imageUrl || '';

      xml += `
  <item>
    <g:id>${escapeXml(product.id)}</g:id>
    <g:title>${name}</g:title>
    <g:description>${description}</g:description>
    <g:link>${SITE_URL}/perfume/${slug}</g:link>
    <g:image_link>${escapeXml(imageUrl)}</g:image_link>
    <g:price>${price} EGP</g:price>
    <g:availability>in_stock</g:availability>
    <g:condition>new</g:condition>
    <g:brand>Aura Perfumes</g:brand>
    <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>
    <g:product_type>${escapeXml(category)}</g:product_type>
    <g:identifier_exists>false</g:identifier_exists>
    <g:shipping>
      <g:country>EG</g:country>
      <g:service>Standard</g:service>
      <g:price>0 EGP</g:price>
    </g:shipping>
  </item>`;
    }

    xml += `
</channel>
</rss>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=43200, s-maxage=43200');
    res.status(200).send(xml);
  } catch (error) {
    console.error('Error generating product feed:', error);
    res.status(500).json({ error: 'Failed to generate product feed' });
  }
}
