import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils/firebaseUtils';
import {
  LayoutDashboard, Package, ShoppingBag, Grid3x3, Tag, Layers, Gift, BarChart3,
  Ticket, Star, Users, UserCog, Settings, LayoutList, Globe, FileText,
  Languages, Ruler, Bell, Activity, ScrollText, LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/SEOHead';
import { motion, AnimatePresence } from 'framer-motion';

// Admin Sub-Components
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminOrders from '../components/admin/AdminOrders';
import AdminProducts from '../components/admin/AdminProducts';
import AdminCategories from '../components/admin/AdminCategories';
import AdminBrands from '../components/admin/AdminBrands';
import AdminCollections from '../components/admin/AdminCollections';
import AdminGiftSets from '../components/admin/AdminGiftSets';
import AdminReports from '../components/admin/AdminReports';
import AdminCoupons from '../components/admin/AdminCoupons';
import AdminReviews from '../components/admin/AdminReviews';
import AdminCustomers from '../components/admin/AdminCustomers';
import AdminUsers from '../components/admin/AdminUsers';
import AdminSettings from '../components/admin/AdminSettings';
import AdminSections from '../components/admin/AdminSections';
import AdminSEO from '../components/admin/AdminSEO';
import AdminPolicies from '../components/admin/AdminPolicies';
import AdminTranslations from '../components/admin/AdminTranslations';
import AdminSizesMapping from '../components/admin/AdminSizesMapping';
import AdminAlerts from '../components/admin/AdminAlerts';
import AdminDiagnostics from '../components/admin/AdminDiagnostics';
import AdminAuditLogs from '../components/admin/AdminAuditLogs';
import { useTranslation } from '../context/TranslationContext';

type TabId = 'dashboard' | 'orders' | 'products' | 'categories' | 'brands' | 'collections' | 'giftSets' |
  'reports' | 'coupons' | 'reviews' | 'customers' | 'users' | 'settings' | 'sections' |
  'seo' | 'policies' | 'translations' | 'sizesMapping' | 'alerts' | 'diagnostics' | 'auditLogs';

interface NavItem {
  id: TabId;
  label: string;
  icon: any;
  section?: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard, section: 'رئيسي' },
  { id: 'orders', label: 'الطلبات', icon: Package },
  { id: 'products', label: 'المنتجات', icon: ShoppingBag, section: 'الكتالوج' },
  { id: 'categories', label: 'الفئات', icon: Grid3x3 },
  { id: 'brands', label: 'العلامات التجارية', icon: Tag },
  { id: 'collections', label: 'المجموعات', icon: Layers },
  { id: 'giftSets', label: 'أطقم الهدايا', icon: Gift },
  { id: 'reports', label: 'التقارير', icon: BarChart3, section: 'التسويق' },
  { id: 'coupons', label: 'الكوبونات', icon: Ticket },
  { id: 'reviews', label: 'التقييمات', icon: Star },
  { id: 'customers', label: 'العملاء', icon: Users, section: 'المستخدمين' },
  { id: 'users', label: 'المستخدمين', icon: UserCog },
  { id: 'settings', label: 'الإعدادات', icon: Settings, section: 'النظام' },
  { id: 'sections', label: 'الأقسام', icon: LayoutList },
  { id: 'seo', label: 'SEO & GEO', icon: Globe },
  { id: 'policies', label: 'السياسات', icon: FileText },
  { id: 'translations', label: 'الترجمات', icon: Languages },
  { id: 'sizesMapping', label: 'خريطة المقاسات', icon: Ruler },
  { id: 'alerts', label: 'التنبيهات', icon: Bell },
  { id: 'diagnostics', label: 'التشخيصات', icon: Activity },
  { id: 'auditLogs', label: 'سجل التدقيق', icon: ScrollText },
];

export default function Admin() {
  const { t, language } = useTranslation();
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  usePageTitle(t('لوحة الإدارة'));
  const { isAdmin, isAuthReady } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [errorState, setErrorState] = useState<Error | null>(null);

  useEffect(() => {
    if (isAuthReady && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isAuthReady, navigate]);

  const fetchPerfumes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'perfumes'));
      setPerfumes(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.GET, 'perfumes');
      } catch (e: any) {
        setErrorState(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      const fetchedOrders = snapshot.docs
        .map(doc => ({ id: doc.id, ...(doc.data() as any) }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(fetchedOrders);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.GET, 'orders');
      } catch (e: any) {
        setErrorState(e);
      }
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPerfumes();
      fetchOrders();
      fetchUsers();
    }
  }, [isAdmin]);

  const handleAddProduct = async (data: any) => {
    try {
      await addDoc(collection(db, 'perfumes'), data);
      fetchPerfumes();
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, 'perfumes');
      } catch (e: any) {
        setErrorState(e);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'perfumes', id));
      fetchPerfumes();
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, `perfumes/${id}`);
      } catch (e: any) {
        setErrorState(e);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchOrders();
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
      } catch (e: any) {
        setErrorState(e);
      }
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      fetchUsers();
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      } catch (e: any) {
        setErrorState(e);
      }
    }
  };

  if (errorState) {
    throw errorState;
  }

  if (!isAdmin) return null;

  const tabLabels: Record<TabId, string> = {
    dashboard: t('لوحة التحكم'), orders: t('الطلبات'), products: t('المنتجات'), categories: t('الفئات'),
    brands: t('العلامات التجارية'), collections: t('المجموعات'), giftSets: t('أطقم الهدايا'),
    reports: t('التقارير'), coupons: t('الكوبونات'), reviews: t('التقييمات'),
    customers: t('العملاء'), users: t('المستخدمين'), settings: t('الإعدادات'),
    sections: t('الأقسام'), seo: t('SEO & GEO'), policies: t('السياسات'),
    translations: t('الترجمات'), sizesMapping: t('خريطة المقاسات'), alerts: t('التنبيهات'),
    diagnostics: t('التشخيصات'), auditLogs: t('سجل التدقيق'),
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard orders={orders} perfumes={perfumes} users={users} />;
      case 'orders': return <AdminOrders orders={orders} loading={ordersLoading} onUpdateStatus={handleUpdateOrderStatus} />;
      case 'products': return <AdminProducts perfumes={perfumes} loading={loading} onAdd={handleAddProduct} onDelete={handleDeleteProduct} />;
      case 'categories': return <AdminCategories />;
      case 'brands': return <AdminBrands />;
      case 'collections': return <AdminCollections />;
      case 'giftSets': return <AdminGiftSets />;
      case 'reports': return <AdminReports orders={orders} perfumes={perfumes} users={users} />;
      case 'coupons': return <AdminCoupons />;
      case 'reviews': return <AdminReviews />;
      case 'customers': return <AdminCustomers users={users} orders={orders} />;
      case 'users': return <AdminUsers users={users} onUpdateRole={handleUpdateUserRole} />;
      case 'settings': return <AdminSettings />;
      case 'sections': return <AdminSections />;
      case 'seo': return <AdminSEO />;
      case 'policies': return <AdminPolicies />;
      case 'translations': return <AdminTranslations perfumes={perfumes} onRefresh={fetchPerfumes} />;
      case 'sizesMapping': return <AdminSizesMapping />;
      case 'alerts': return <AdminAlerts perfumes={perfumes} />;
      case 'diagnostics': return <AdminDiagnostics />;
      case 'auditLogs': return <AdminAuditLogs />;
      default: return <AdminDashboard orders={orders} perfumes={perfumes} users={users} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans" dir={dir} style={{ background: '#0f172a' }}>
      <SEOHead title={t('لوحة الإدارة')} noindex={true} />

      {/* Sidebar */}
      <aside className={`h-screen fixed ${dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'} top-0 bg-[#1a1f37] flex flex-col z-50 border-white/5 transition-all duration-300 ${sidebarCollapsed ? 'w-[68px]' : 'w-[250px]'}`}>
        {/* Logo */}
        <div className={`px-4 pt-6 pb-4 border-b border-white/5 ${sidebarCollapsed ? 'text-center' : ''}`}>
          {sidebarCollapsed ? (
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto">
              <span className="text-white font-bold text-sm">A</span>
            </div>
          ) : (
            <div>
              <h1 className="font-serif text-lg text-white tracking-wider">Aura Admin</h1>
              <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">Management Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showSection = item.section && !sidebarCollapsed;
            return (
              <React.Fragment key={item.id}>
                {showSection && (
                  <p className="text-[9px] font-bold tracking-[0.2em] text-slate-500 uppercase px-3 pt-4 pb-1.5">{t(item.section!)}</p>
                )}
                <button
                  onClick={() => setActiveTab(item.id)}
                  title={sidebarCollapsed ? t(item.label) : undefined}
                  className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${sidebarCollapsed ? 'px-0 py-2.5 justify-center' : 'px-3 py-2.5'} ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-400' : ''}`} strokeWidth={isActive ? 2.5 : 1.8} />
                  {!sidebarCollapsed && <span className="text-[13px] font-medium truncate">{t(item.label)}</span>}
                  {isActive && !sidebarCollapsed && <span className={`w-1.5 h-1.5 rounded-full bg-indigo-400 ${dir === 'rtl' ? 'mr-auto' : 'ml-auto'}`} />}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`border-t border-white/5 p-3 ${sidebarCollapsed ? 'text-center' : ''}`}>
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors flex items-center justify-center gap-2">
            {sidebarCollapsed ? (
              dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span className="text-xs">{t('طي القائمة')}</span>
              </>
            )}
          </button>
          <button onClick={() => navigate('/')}
            className={`w-full p-2 mt-1 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-colors flex items-center gap-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <LogOut className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            {!sidebarCollapsed && <span className="text-xs">{t('العودة للمتجر')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${sidebarCollapsed ? (dir === 'rtl' ? 'mr-[68px]' : 'ml-[68px]') : (dir === 'rtl' ? 'mr-[250px]' : 'ml-[250px]')}`}>
        {/* Top Header */}
        <header className="h-16 px-6 flex items-center justify-between bg-[#1a1f37]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">{tabLabels[activeTab]}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-linear-to-br from-indigo-500 to-purple-600">
              <img src="https://ui-avatars.com/api/?name=Admin&background=4F46E5&color=fff&size=32" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
