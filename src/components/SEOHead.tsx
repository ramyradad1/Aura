import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../context/TranslationContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  noindex?: boolean;
  schema?: object | object[];
  canonicalUrl?: string;
}

const SITE_NAME = 'Aura Perfumes';
const DEFAULT_DESCRIPTION = 'Aura Perfumes — متجر عطور مستوحاة من أشهر الماركات العالمية بجودة عالية وثبات يدوم. تسوق عطور رجالية ونسائية وللجنسين بأسعار مناسبة.';
const DEFAULT_IMAGE = 'https://www.aura-perfumes.online/og-image.jpg';
const BASE_URL = 'https://www.aura-perfumes.online';

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  ogImage = DEFAULT_IMAGE,
  ogUrl,
  ogType = 'website',
  noindex = false,
  schema,
  canonicalUrl,
}: SEOHeadProps) {
  const { t, language } = useTranslation();

  const translatedTitle = title ? t(title) : undefined;
  const translatedDesc = t(description);
  const defaultTitleSuffix = t('عطور مستوحاة بجودة عالمية وثبات عالي');

  const fullTitle = translatedTitle ? `${translatedTitle} | ${SITE_NAME}` : `${SITE_NAME} | ${defaultTitleSuffix}`;
  const fullUrl = ogUrl ? `${BASE_URL}${ogUrl}` : BASE_URL;
  const canonical = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : fullUrl;

  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const isArabic = language === 'ar';

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={translatedDesc} />
      {keywords && <meta name="keywords" content={t(keywords)} />}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      )}
      <link rel="canonical" href={canonical} />

      {/* hreflang */}
      <link rel="alternate" hrefLang="ar-EG" href={canonical} />
      <link rel="alternate" hrefLang="ar" href={canonical} />
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={translatedDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={isArabic ? 'ar_EG' : 'en_US'} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={translatedDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schemas */}
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
