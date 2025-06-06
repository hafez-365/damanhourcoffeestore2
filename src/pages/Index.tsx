import React, { Suspense, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/Navbar';
import WhatsAppButton from '@/components/WhatsAppButton';
import { Loader2 } from 'lucide-react';

// Dynamic imports with prefetch
const LazyHero = React.lazy(() => import(/* webpackPrefetch: true */ '@/components/Hero'));
const LazyProducts = React.lazy(() => import(/* webpackPrefetch: true */ '@/components/Products'));
const LazyAbout = React.lazy(() => import(/* webpackPrefetch: true */ '@/components/About'));
const LazyContact = React.lazy(() => import(/* webpackPrefetch: true */ '@/components/Contact'));

// Create a specialized loading component with skeleton UI
const LoadingSpinner = ({ height = 64 }: { height?: number }) => (
  <div 
    className={`flex items-center justify-center h-[${height}px]`} 
    aria-live="polite" 
    aria-busy="true"
  >
    <div className="text-center">
      <Loader2 className="animate-spin text-amber-600 mx-auto" size={48} />
      <span className="sr-only">جاري التحميل...</span>
      <p className="mt-2 text-amber-700">جاري تحميل أفضل تجربة قهوة...</p>
    </div>
  </div>
);

// Skeleton loader with pulse animation for better UX
const SkeletonLoader = ({ height = 300 }: { height?: number }) => (
  <div className="animate-pulse rounded-xl bg-amber-100" style={{ height: `${height}px` }}>
    <div className="h-full flex items-center justify-center">
      <div className="bg-amber-200 rounded-full w-12 h-12"></div>
    </div>
  </div>
);

// تعريف نوع لبيانات وسائل التواصل الاجتماعي
interface SocialProfile {
  name: string;
  url: string;
}

const Index = () => {
  // Save basic layout data to localStorage on first load
  useEffect(() => {
    if (!localStorage.getItem('siteLayout')) {
      const layoutData = {
        navbar: true,
        footer: true,
        contactInfo: {
          phone: '+201229204276',
          address: 'شارع الجمهورية، دمنهور'
        }
      };
      localStorage.setItem('siteLayout', JSON.stringify(layoutData));
    }
  }, []);

  // Social Media Profiles
  const socialProfiles: SocialProfile[] = [
    { name: 'Facebook', url: 'https://www.facebook.com/damanhourcoffee' },
    { name: 'Instagram', url: 'https://www.instagram.com/damanhourcoffee/' },
    { name: 'LinkedIn', url: 'http://www.linkedin.com/in/damanhour-coffee-493977369/' },
    { name: 'Pinterest', url: 'https://www.pinterest.com/damanhourcoffee/' },
    { name: 'TikTok', url: 'https://www.tiktok.com/@damanhourcoffee/' },
    { name: 'Twitter', url: 'https://x.com/damanhourcoffee/' },
    { name: 'YouTube', url: 'https://www.youtube.com/channel/UCboc92ZAMccLNAn5OPtAHfQ' }
  ];

  // Main structured data for Cafe
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "name": "قهوة دمنهور",
    "description": "متخصصون في تقديم أجود أنواع القهوة العربية والبن الفاخر في دمنهور",
    "image": "https://damanhourcoffee.netlify.app/images/logo.webp",
    "@id": "https://damanhourcoffee.netlify.app",
    "url": "https://damanhourcoffee.netlify.app",
    "telephone": "+201229204276",
    "priceRange": "$$",
    "servesCuisine": ["Arabic Coffee", "Turkish Coffee", "Espresso"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "شارع الجمهورية",
      "addressLocality": "دمنهور",
      "addressRegion": "البحيرة",
      "postalCode": "22511",
      "addressCountry": "EG"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 31.0419,
      "longitude": 30.4730
    },
    "openingHoursSpecification": [{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "08:00",
      "closes": "23:00"
    },{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Sunday"],
      "opens": "09:00",
      "closes": "22:00"
    }],
    "menu": "https://damanhourcoffee.netlify.app/menu",
    "acceptsReservations": true,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "عروض القهوة",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "القهوة العربية",
          "itemListElement": [
            {
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "قهوة عربية أصيلة"
              }
            }
          ]
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "47",
      "bestRating": "5"
    },
    "sameAs": socialProfiles.map(profile => profile.url),
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://damanhourcoffee.netlify.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Breadcrumb structured data
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "الرئيسية",
      "item": "https://damanhourcoffee.netlify.app/"
    }, {
      "@type": "ListItem",
      "position": 2,
      "name": "منتجاتنا",
      "item": "https://damanhourcoffee.netlify.app/products"
    }]
  };

  return (
    <div 
      dir="rtl" 
      lang="ar"
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50" 
      itemScope 
      itemType="https://schema.org/CafeOrCoffeeShop"
      aria-label="موقع قهوة دمنهور"
    >
      {/* Skip Navigation Link */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:right-2 focus:bg-amber-600 focus:text-white focus:p-2 focus:rounded"
      >
        تخطي إلى المحتوى الرئيسي
      </a>

      <Helmet>
        <html lang="ar" />
        <title>قهوة دمنهور | أجود أنواع البن والقهوة الفاخرة في دمنهور - شارع الجمهورية</title>
        <meta
          name="description"
          content="قهوة دمنهور تقدم أجود أنواع القهوة العربية والبن الفاخر المطحون طازجاً يومياً. توصيل مجاني داخل دمنهور - شارع الجمهورية - هاتف: 01229204276"
        />
        <meta 
          name="keywords" 
          content="قهوة دمنهور, بن دمنهور, قهوة شارع الجمهورية, مشروبات ساخنة دمنهور, قهوة عربية أصيلة, بن يمني, قهوة تركية, إسبريسو, كابتشينو, مقهى دمنهور, توصيل قهوة دمنهور, محامص دمنهور, أجود بن في البحيرة, قهوة مطحونة طازجة, هدايا عشاق القهوة" 
        />
        <link rel="canonical" href="https://damanhourcoffee.netlify.app/" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="قهوة دمنهور | أجود أنواع البن والقهوة الفاخرة" />
        <meta property="og:description" content="اكتشف عالم القهوة الفاخرة مع تشكيلتنا المميزة من البن العربي الأصيل في دمنهور" />
        <meta property="og:image" content="https://damanhourcoffee.netlify.app/images/og-image.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://damanhourcoffee.netlify.app/" />
        <meta property="og:locale" content="ar_EG" />
        <meta property="og:site_name" content="قهوة دمنهور" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="قهوة دمنهور | قهوة عربية فاخرة" />
        <meta name="twitter:description" content="بن مختار بعناية وطحن يومي لضمان الجودة العالية" />
        <meta name="twitter:image" content="https://damanhourcoffee.netlify.app/images/twitter-card.webp" />
        <meta name="twitter:site" content="@damanhourcoffee" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        
        {/* Breadcrumb Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
        
        {/* Favicon */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#a16207" />
        
        {/* Preconnect for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://api.damanhourcoffee.com" />
        
        {/* Search Engine Verification */}
        <meta name="google-site-verification" content="YOUR_GOOGLE_SEARCH_CONSOLE_CODE" />
        <meta name="yandex-verification" content="YOUR_YANDEX_VERIFICATION_CODE" />
        <meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE" />
      </Helmet>

      <Navbar />
      
      <main id="main-content">
        <Suspense fallback={<SkeletonLoader height={600} />}>
          <LazyHero />
        </Suspense>
        
        <Suspense fallback={<SkeletonLoader height={800} />}>
          <LazyProducts />
        </Suspense>
        
        <Suspense fallback={<SkeletonLoader height={500} />}>
          <LazyAbout />
        </Suspense>
        
        <Suspense fallback={<SkeletonLoader height={700} />}>
          <LazyContact />
        </Suspense>
      </main>
      
      <WhatsAppButton />
    </div>
  );
};

export default React.memo(Index);