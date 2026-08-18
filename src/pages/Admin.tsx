import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Role, canAssignRole } from '../config/roles';

import { useNavigate } from 'react-router-dom';
import { handleFirestoreError, OperationType } from '../utils/firebaseUtils';
import {
  LayoutDashboard, Package, ShoppingBag, Grid3x3, Tag, Layers, Gift, BarChart3,
  Ticket, Star, Users, UserCog, Settings, LayoutList, Globe, FileText,
  Languages, Ruler, Bell, Activity, ScrollText, LogOut, ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react';
import { usePageTitle } from '../hooks/usePageTitle';
import SEOHead from '../components/SEOHead';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '../components/Logo';

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
  const { isAdmin, isAuthReady, role: actorRole, can } = useAuth();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [perfumes, setPerfumes] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (isAuthReady && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, isAuthReady, navigate]);

  const fetchPerfumes = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'perfumes'));
      setPerfumes(snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));
    } catch (error: any) {
      console.error('Error fetching perfumes:', error);
      toast(t('تعذر جلب المنتجات') + ': ' + (error?.message || ''), 'error');
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
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast(t('تعذر جلب الطلبات') + ': ' + (error?.message || ''), 'error');
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

  const fetchInvites = async () => {
    if (!can('users.invite')) return;
    try {
      const snapshot = await getDocs(collection(db, 'roleInvites'));
      setInvites(snapshot.docs.map(d => ({ id: d.id, email: d.id, ...(d.data() as any) })));
    } catch (error) {
      console.error("Error fetching invites:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPerfumes();
      fetchOrders();
      fetchUsers();
      fetchInvites();
    }
  }, [isAdmin]);


  const handleAddProduct = async (data: any) => {
    try {
      await addDoc(collection(db, 'perfumes'), data);
      toast(t('تمت إضافة المنتج بنجاح'), 'success');
      fetchPerfumes();
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast(t('تعذر إضافة المنتج') + ': ' + (error?.message || ''), 'error');
    }
  };

  const handleUpdateProduct = async (id: string, data: any) => {
    try {
      await updateDoc(doc(db, 'perfumes', id), data);
      toast(t('تم تحديث المنتج بنجاح'), 'success');
      fetchPerfumes();
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast(t('تعذر تحديث المنتج') + ': ' + (error?.message || ''), 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'perfumes', id));
      toast(t('تم حذف المنتج بنجاح'), 'success');
      fetchPerfumes();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast(t('تعذر حذف المنتج') + ': ' + (error?.message || ''), 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast(t('تم تحديث حالة الطلب بنجاح'), 'success');
      fetchOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast(t('تعذر تحديث حالة الطلب') + ': ' + (error?.message || ''), 'error');
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: Role) => {
    // Client-side guard; firestore.rules enforces the same thing server-side.
    if (!can('users.changeRole') || !canAssignRole(actorRole, newRole)) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast(t('تم تحديث صلاحية المستخدم بنجاح'), 'success');
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast(t('تعذر تغيير الدور') + ': ' + (error?.message || ''), 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!can('users.delete')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast(t('تم حذف المستخدم بنجاح'), 'success');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast(t('تعذر حذف المستخدم') + ': ' + (error?.message || ''), 'error');
    }
  };

  /**
   * Invites are keyed by email so the role can be claimed on first login.
   * No account is created here, we only reserve the role.
   */
  const handleInviteUser = async (email: string, inviteRole: Role) => {
    if (!can('users.invite') || !canAssignRole(actorRole, inviteRole)) return;
    const key = email.trim().toLowerCase();
    try {
      await setDoc(doc(db, 'roleInvites', key), {
        email: key,
        role: inviteRole,
        createdAt: new Date().toISOString(),
      });
      toast(t('تم إرسال الدعوة بنجاح'), 'success');
      fetchInvites();
    } catch (error: any) {
      console.error('Error creating invite:', error);
      toast(t('تعذر إرسال الدعوة') + ': ' + (error?.message || ''), 'error');
    }
  };

  const handleRevokeInvite = async (email: string) => {
    if (!can('users.invite')) return;
    const key = email.trim().toLowerCase();
    try {
      await deleteDoc(doc(db, 'roleInvites', key));
      toast(t('تم إلغاء الدعوة بنجاح'), 'success');
      fetchInvites();
    } catch (error: any) {
      console.error('Error revoking invite:', error);
      toast(t('تعذر إلغاء الدعوة') + ': ' + (error?.message || ''), 'error');
    }
  };

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
      case 'products': return (
        <AdminProducts
          perfumes={perfumes}
          loading={loading}
          onAdd={handleAddProduct}
          onUpdate={handleUpdateProduct}
          onDelete={handleDeleteProduct}
        />
      );

      case 'categories': return <AdminCategories />;
      case 'brands': return <AdminBrands />;
      case 'collections': return <AdminCollections />;
      case 'giftSets': return <AdminGiftSets perfumes={perfumes} />;
      case 'reports': return <AdminReports orders={orders} perfumes={perfumes} users={users} />;
      case 'coupons': return <AdminCoupons />;
      case 'reviews': return <AdminReviews />;
      case 'customers': return <AdminCustomers users={users} orders={orders} />;
      case 'users': return (
        <AdminUsers
          users={users}
          invites={invites}
          onUpdateRole={handleUpdateUserRole}
          onDeleteUser={handleDeleteUser}
          onInvite={handleInviteUser}
          onRevokeInvite={handleRevokeInvite}
        />
      );

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

  // Off-canvas transform for the mobile drawer, direction aware.
  const drawerHidden = dir === 'rtl' ? 'translate-x-full' : '-translate-x-full';
  const sidebarWidth = sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[264px]';
  const contentOffset = sidebarCollapsed
    ? (dir === 'rtl' ? 'lg:mr-[76px]' : 'lg:ml-[76px]')
    : (dir === 'rtl' ? 'lg:mr-[264px]' : 'lg:ml-[264px]');

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-admin-bg text-white" dir={dir}>
      <SEOHead title={t('لوحة الإدارة')} noindex={true} />

      {/* Mobile drawer backdrop */}
      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileNavOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`h-screen fixed top-0 ${dir === 'rtl' ? 'right-0 border-l' : 'left-0 border-r'} w-[264px] ${sidebarWidth} bg-admin-surface border-white/[0.06] flex flex-col z-50 transition-[transform,width] duration-300 ease-out lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : drawerHidden}`}
      >
        {/* Brand */}
        <div className={`h-16 shrink-0 flex items-center gap-2 border-b border-white/[0.06] ${sidebarCollapsed ? 'lg:justify-center px-3' : 'px-4'}`}>
          <Logo onDark className={sidebarCollapsed ? 'lg:[&>span:last-child]:hidden' : ''} />
          <button
            onClick={() => setMobileNavOpen(false)}
            aria-label={t('إغلاق القائمة')}
            className="lg:hidden ms-auto w-9 h-9 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 admin-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <p className={`text-[9px] font-bold tracking-[0.2em] text-gold-500/50 uppercase px-3 pt-4 pb-1.5 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                    {t(item.section)}
                  </p>
                )}
                <button
                  onClick={() => { setActiveTab(item.id); setMobileNavOpen(false); }}
                  title={sidebarCollapsed ? t(item.label) : undefined}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''} ${isActive
                    ? 'bg-gold-500/12 text-gold-300 ring-1 ring-gold-500/25'
                    : 'text-white/55 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.4 : 1.8} />
                  <span className={`text-[13px] font-medium truncate ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{t(item.label)}</span>
                  {isActive && (
                    <span className={`w-1.5 h-1.5 rounded-full bg-gold-500 ${dir === 'rtl' ? 'mr-auto' : 'ml-auto'} ${sidebarCollapsed ? 'lg:hidden' : ''}`} />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] p-3 shrink-0">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? t('توسيع القائمة') : t('طي القائمة')}
            className="hidden lg:flex w-full p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-colors items-center justify-center gap-2"
          >
            {sidebarCollapsed ? (
              dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                {dir === 'rtl' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span className="text-xs">{t('طي القائمة')}</span>
              </>
            )}
          </button>
          <button
            onClick={() => navigate('/')}
            className={`w-full p-2 mt-1 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2 ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
          >
            <LogOut className={`w-4 h-4 shrink-0 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            <span className={`text-xs ${sidebarCollapsed ? 'lg:hidden' : ''}`}>{t('العودة للمتجر')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col h-screen overflow-hidden transition-[margin] duration-300 ${contentOffset}`}>
        {/* Top Header */}
        <header className="h-16 shrink-0 px-4 sm:px-6 flex items-center justify-between bg-admin-surface/80 backdrop-blur-xl border-b border-white/[0.06] sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label={t('فتح القائمة')}
              className="lg:hidden w-10 h-10 -ms-2 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white truncate">{tabLabels[activeTab]}</h2>
              <p className="hidden sm:block text-[10px] tracking-[0.2em] uppercase text-gold-500/50">Aura Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 text-[11px] font-medium text-white/45 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {t('متصل')}
            </span>
            <div className="w-9 h-9 rounded-xl bg-gold-gradient flex items-center justify-center text-primary font-bold text-xs shrink-0">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto admin-scroll p-4 sm:p-6 pb-16">
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
