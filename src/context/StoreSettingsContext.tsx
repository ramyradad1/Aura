import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
    DEFAULT_STORE_SETTINGS,
    STORE_SETTINGS_DOC,
    StoreSettings,
    mergeStoreSettings,
    resolveShippingFee,
    sanitizeWhatsAppNumber,
} from '../config/store';

interface StoreSettingsContextValue {
    settings: StoreSettings;
    /** False until the first Firestore snapshot arrives. Defaults are used meanwhile. */
    isLoaded: boolean;
    /** Persists a partial update to `settings/store`. Admin-only per firestore.rules. */
    saveSettings: (patch: Partial<StoreSettings>) => Promise<void>;
    /** Shipping cost for a subtotal, honouring the free-shipping threshold. */
    getShippingFee: (subtotal: number, itemCount: number) => number;
    /** Formats a number with the configured currency label. */
    formatPrice: (value: number) => string;
    /** wa.me link with an optional prefilled message. */
    whatsappLink: (message?: string) => string;
}

const StoreSettingsContext = createContext<StoreSettingsContextValue | undefined>(undefined);

/**
 * Live store settings, editable from the admin panel.
 *
 * Reads `settings/store` in realtime so a change in the panel reflects on the
 * storefront without a redeploy. If the document is missing or unreadable the
 * defaults from src/config/store.ts are used, so the store never breaks.
 */
export function StoreSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const ref = doc(db, STORE_SETTINGS_DOC.collection, STORE_SETTINGS_DOC.id);
        const unsubscribe = onSnapshot(
            ref,
            snapshot => {
                setSettings(snapshot.exists() ? mergeStoreSettings(snapshot.data()) : DEFAULT_STORE_SETTINGS);
                setIsLoaded(true);
            },
            error => {
                // Offline or rules denied: keep serving the defaults.
                console.warn('Store settings unavailable, using defaults:', error);
                setIsLoaded(true);
            }
        );
        return unsubscribe;
    }, []);

    const value = useMemo<StoreSettingsContextValue>(() => ({
        settings,
        isLoaded,
        saveSettings: async (patch: Partial<StoreSettings>) => {
            const normalized: Partial<StoreSettings> = { ...patch };
            if (typeof normalized.whatsappNumber === 'string') {
                normalized.whatsappNumber = sanitizeWhatsAppNumber(normalized.whatsappNumber);
            }
            await setDoc(
                doc(db, STORE_SETTINGS_DOC.collection, STORE_SETTINGS_DOC.id),
                { ...normalized, updatedAt: new Date().toISOString() },
                { merge: true }
            );
        },
        getShippingFee: (subtotal: number, itemCount: number) =>
            resolveShippingFee(settings, subtotal, itemCount),
        formatPrice: (value: number) => `${value.toLocaleString('en-US')} ${settings.currency}`,
        whatsappLink: (message?: string) =>
            `https://wa.me/${settings.whatsappNumber}${message ? `?text=${encodeURIComponent(message)}` : ''}`,
    }), [settings, isLoaded]);

    return (
        <StoreSettingsContext.Provider value={value}>
            {children}
        </StoreSettingsContext.Provider>
    );
}

export function useStoreSettings(): StoreSettingsContextValue {
    const context = useContext(StoreSettingsContext);
    if (!context) {
        throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
    }
    return context;
}
