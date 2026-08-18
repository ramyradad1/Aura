/**
 * Store-wide commercial settings.
 *
 * These values are only the *fallback* defaults used before Firestore responds
 * (or if the settings document was never created). The live values are managed
 * from the admin panel → الإعدادات, stored in `settings/store`, and consumed
 * through `useStoreSettings()` in src/context/StoreSettingsContext.tsx.
 *
 * Read settings from the context in components, not from this file, otherwise
 * changes made in the admin panel will not show up.
 */

export interface StoreSettings {
    /** WhatsApp number in international format, digits only. e.g. 201030769960 */
    whatsappNumber: string;
    storeName: string;
    storeUrl: string;
    /** Currency label shown next to prices. */
    currency: string;
    /** Flat shipping fee. */
    shippingFee: number;
    /** Orders at or above this subtotal ship for free. 0 disables it. */
    freeShippingThreshold: number;
    /** Card / online payment. Off means every order goes through WhatsApp. */
    onlinePaymentEnabled: boolean;
    /** Greeting used by the floating WhatsApp support button. */
    whatsappGreeting: string;
    /** Shown on the checkout page next to the shipping fee. */
    deliveryTimeText: string;
    /** Show recently viewed items on storefront. */
    recentlyViewed?: boolean;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
    // 201030769960 === local 01030769960 (Egypt: +20 with the leading 0 dropped)
    whatsappNumber: import.meta.env.VITE_STORE_WHATSAPP || '201030769960',
    storeName: 'Aura Perfumes',
    storeUrl: 'https://www.aura-perfumes.online',
    currency: 'ج.م',
    shippingFee: 90,
    freeShippingThreshold: 0,
    onlinePaymentEnabled: false,
    whatsappGreeting: 'مرحباً! أحتاج مساعدة في اختيار عطر من Aura Perfumes 🌸',
    deliveryTimeText: '2-5 أيام عمل',
    recentlyViewed: true,
};

/** Firestore location of the live settings document. */
export const STORE_SETTINGS_DOC = { collection: 'settings', id: 'store' } as const;

/** Digits only — wa.me rejects "+", spaces and dashes. */
export function sanitizeWhatsAppNumber(value: string): string {
    return (value || '').replace(/\D/g, '');
}

/**
 * Merges a raw Firestore document over the defaults, dropping anything with the
 * wrong type so a bad manual edit can never break the storefront.
 */
export function mergeStoreSettings(raw: unknown): StoreSettings {
    const data = (raw ?? {}) as Partial<Record<keyof StoreSettings, unknown>>;
    const str = (key: keyof StoreSettings) =>
        typeof data[key] === 'string' && (data[key] as string).trim()
            ? (data[key] as string).trim()
            : undefined;
    const num = (key: keyof StoreSettings) =>
        typeof data[key] === 'number' && Number.isFinite(data[key] as number) && (data[key] as number) >= 0
            ? (data[key] as number)
            : undefined;

    const whatsapp = sanitizeWhatsAppNumber(str('whatsappNumber') || '');

    return {
        whatsappNumber: whatsapp || DEFAULT_STORE_SETTINGS.whatsappNumber,
        storeName: str('storeName') ?? DEFAULT_STORE_SETTINGS.storeName,
        storeUrl: str('storeUrl') ?? DEFAULT_STORE_SETTINGS.storeUrl,
        currency: str('currency') ?? DEFAULT_STORE_SETTINGS.currency,
        shippingFee: num('shippingFee') ?? DEFAULT_STORE_SETTINGS.shippingFee,
        freeShippingThreshold: num('freeShippingThreshold') ?? DEFAULT_STORE_SETTINGS.freeShippingThreshold,
        onlinePaymentEnabled:
            typeof data.onlinePaymentEnabled === 'boolean'
                ? data.onlinePaymentEnabled
                : DEFAULT_STORE_SETTINGS.onlinePaymentEnabled,
        whatsappGreeting: str('whatsappGreeting') ?? DEFAULT_STORE_SETTINGS.whatsappGreeting,
        deliveryTimeText: str('deliveryTimeText') ?? DEFAULT_STORE_SETTINGS.deliveryTimeText,
        recentlyViewed:
            typeof data.recentlyViewed === 'boolean'
                ? data.recentlyViewed
                : DEFAULT_STORE_SETTINGS.recentlyViewed,
    };
}

/**
 * Shipping cost for a given subtotal, honouring the free shipping threshold.
 * An empty cart never pays shipping.
 */
export function resolveShippingFee(settings: StoreSettings, subtotal: number, itemCount: number): number {
    if (itemCount <= 0) return 0;
    if (settings.freeShippingThreshold > 0 && subtotal >= settings.freeShippingThreshold) return 0;
    return settings.shippingFee;
}

/**
 * Legacy constants kept so non-React code (build scripts, utilities without
 * context access) still compiles. Prefer `useStoreSettings()` in components.
 */
export const STORE_WHATSAPP = DEFAULT_STORE_SETTINGS.whatsappNumber;
export const STORE_NAME = DEFAULT_STORE_SETTINGS.storeName;
export const STORE_URL = DEFAULT_STORE_SETTINGS.storeUrl;
export const CURRENCY = DEFAULT_STORE_SETTINGS.currency;
export const SHIPPING_FEE = DEFAULT_STORE_SETTINGS.shippingFee;
