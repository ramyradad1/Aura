/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { UserPreferencesProvider } from './context/UserPreferencesContext';
import { ToastProvider } from './context/ToastContext';
import { TranslationProvider } from './context/TranslationContext';
import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import WhatsAppButton from './components/WhatsAppButton';
import { lazy, Suspense } from 'react';

const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const AIStudio = lazy(() => import('./pages/AIStudio'));
const Admin = lazy(() => import('./pages/Admin'));
const PerfumeDetails = lazy(() => import('./pages/PerfumeDetails'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Compare = lazy(() => import('./pages/Compare'));
const PerfumeQuiz = lazy(() => import('./pages/PerfumeQuiz'));
const NotFound = lazy(() => import('./pages/NotFound'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const Refund = lazy(() => import('./pages/Refund'));
const Contact = lazy(() => import('./pages/Contact'));
const Profile = lazy(() => import('./pages/Profile'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const LandingMenPerfumes = lazy(() => import('./pages/LandingMenPerfumes'));
const LandingWomenPerfumes = lazy(() => import('./pages/LandingWomenPerfumes'));
const LandingGiftPerfumes = lazy(() => import('./pages/LandingGiftPerfumes'));
const PerfumeComparison = lazy(() => import('./pages/PerfumeComparison'));

const FallbackLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
  </div>
);
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      <main className="flex-1">
        <Suspense fallback={<FallbackLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop/:category" element={<Shop />} />
            <Route path="/perfume/:id" element={<PerfumeDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/ai-studio" element={<AIStudio />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/quiz" element={<PerfumeQuiz />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/refund" element={<Refund />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/عطور-رجالي-مصر" element={<LandingMenPerfumes />} />
            <Route path="/عطور-نسائية-فاخرة" element={<LandingWomenPerfumes />} />
            <Route path="/عطور-هدايا" element={<LandingGiftPerfumes />} />
            <Route path="/مقارنة-العطور" element={<PerfumeComparison />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Chatbot />}
      {!isAdminRoute && <WhatsAppButton />}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <CartProvider>
          <UserPreferencesProvider>
            <ToastProvider>
              <Router>
                <AppContent />
              </Router>
            </ToastProvider>
          </UserPreferencesProvider>
        </CartProvider>
      </AuthProvider>
    </TranslationProvider>
  );
}

