import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Clock, Tag, Share2 } from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { blogArticles } from './Blog';
import React from 'react';

// Internal linking: maps product names and SEO keywords to their shop categories
const PRODUCT_LINKS: { keyword: string; path: string; label: string }[] = [
  { keyword: 'عطور رجالية', path: '/shop/men', label: 'عطور رجالية' },
  { keyword: 'عطور رجالي', path: '/shop/men', label: 'عطور رجالي' },
  { keyword: 'عطور نسائية', path: '/shop/women', label: 'عطور نسائية' },
  { keyword: 'عطر نسائي', path: '/shop/women', label: 'عطر نسائي' },
  { keyword: 'عطور للجنسين', path: '/shop/unisex', label: 'عطور للجنسين' },
  { keyword: 'عطور مستوحاة', path: '/shop/all', label: 'عطور مستوحاة' },
  { keyword: 'بدائل العطور', path: '/shop/all', label: 'بدائل العطور' },
  { keyword: 'عطور هدايا', path: '/shop/all', label: 'عطور هدايا' },
  { keyword: 'Aura Noir', path: '/shop/men', label: 'Aura Noir' },
  { keyword: 'Aura Bleu', path: '/shop/men', label: 'Aura Bleu' },
  { keyword: 'Aura Oud', path: '/shop/unisex', label: 'Aura Oud' },
  { keyword: 'Aura Rose', path: '/shop/women', label: 'Aura Rose' },
  { keyword: 'Aura Blanc', path: '/shop/women', label: 'Aura Blanc' },
  { keyword: 'Aura Gold', path: '/shop/unisex', label: 'Aura Gold' },
  { keyword: 'Aura Perfumes', path: '/shop/all', label: 'Aura Perfumes' },
];

function renderWithProductLinks(text: string): React.ReactNode {
  // Build regex from all keywords, longest first to avoid partial matches
  const sortedKeywords = [...PRODUCT_LINKS].sort((a, b) => b.keyword.length - a.keyword.length);
  const regex = new RegExp(`(${sortedKeywords.map(k => k.keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    const link = PRODUCT_LINKS.find(l => l.keyword === part);
    if (link) {
      return (
        <Link key={i} to={link.path} className="text-tertiary font-bold hover:underline hover:text-primary transition-colors">
          {link.label}
        </Link>
      );
    }
    return part;
  });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const article = blogArticles.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center" dir="rtl">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-serif text-primary">المقال غير موجود</h1>
          <Link to="/blog" className="text-tertiary hover:underline">العودة للمدونة</Link>
        </div>
      </div>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: `https://www.aura-perfumes.online${article.image}`,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      '@type': 'Organization',
      name: 'Aura Perfumes',
      url: 'https://www.aura-perfumes.online',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aura Perfumes',
      logo: { '@type': 'ImageObject', url: 'https://www.aura-perfumes.online/icon.png' },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.aura-perfumes.online/blog/${article.slug}`,
    },
    inLanguage: 'ar',
    keywords: article.keywords,
  };

  const otherArticles = blogArticles.filter(a => a.id !== article.id);

  return (
    <div className="min-h-screen bg-surface" dir="rtl">
      <SEOHead
        title={article.title}
        description={article.excerpt}
        keywords={article.keywords}
        ogUrl={`/blog/${article.slug}`}
        schema={[articleSchema]}
      />

      {/* Hero */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-[#1a0a2e]/90 via-[#1a0a2e]/50 to-transparent z-10" />
        <img src={article.image} alt={article.title} className="w-full h-full object-cover" loading="eager" />
        <div className="absolute bottom-0 inset-x-0 z-20 p-8 md:p-16 max-w-[900px] mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center gap-4 text-white/70 text-xs">
              <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{article.category}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{article.readTime}</span>
              <span>{new Date(article.date).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-serif text-white leading-tight">{article.title}</h1>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-[800px] mx-auto px-6 md:px-12 py-16 space-y-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ArrowRight className="h-3 w-3 rotate-180" />
          <Link to="/blog" className="hover:text-primary transition-colors">المدونة</Link>
          <ArrowRight className="h-3 w-3 rotate-180" />
          <span className="text-primary font-medium truncate">{article.title}</span>
        </nav>

        {/* Article Body with Internal Links */}
        {article.content.map((paragraph, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05 }}
            className="text-on-surface/80 leading-loose text-base whitespace-pre-line"
          >
            {renderWithProductLinks(paragraph)}
          </motion.div>
        ))}

        {/* CTA */}
        <div className="bg-linear-to-l from-primary/5 to-tertiary-gold/5 border border-outline-variant/20 rounded-2xl p-8 text-center space-y-4 mt-12">
          <h3 className="text-2xl font-serif text-primary">جرّب عطور Aura بنفسك</h3>
          <p className="text-on-surface-variant text-sm">اكتشف مجموعتنا الكاملة من العطور المستوحاة بجودة عالية وسعر مناسب</p>
          <Link
            to="/shop/all"
            className="inline-block px-8 py-3 bg-tertiary-gold text-[#241a00] rounded-lg text-sm font-bold hover:brightness-110 transition-all"
          >
            تسوق الآن
          </Link>
        </div>

        {/* Share */}
        <div className="flex items-center gap-3 pt-6 border-t border-outline-variant/20">
          <Share2 className="h-4 w-4 text-on-surface-variant" />
          <span className="text-sm text-on-surface-variant">شارك المقال:</span>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(article.title + ' https://www.aura-perfumes.online/blog/' + article.slug)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-full hover:bg-green-600 transition-colors"
          >
            واتساب
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=https://www.aura-perfumes.online/blog/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
          >
            فيسبوك
          </a>
        </div>
      </article>

      {/* Related Articles */}
      {otherArticles.length > 0 && (
        <section className="py-16 px-6 md:px-12 max-w-[1100px] mx-auto border-t border-outline-variant/10">
          <h2 className="text-3xl font-serif text-primary mb-10 text-center">مقالات أخرى</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherArticles.map((a) => (
              <Link key={a.id} to={`/blog/${a.slug}`} className="group flex gap-4 items-center bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <img src={a.image} alt={a.title} className="w-24 h-24 rounded-lg object-cover shrink-0" loading="lazy" />
                <div className="space-y-1">
                  <h3 className="text-sm font-serif text-primary group-hover:text-primary-container transition-colors leading-snug">{a.title}</h3>
                  <p className="text-xs text-on-surface-variant">{a.readTime} • {a.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
