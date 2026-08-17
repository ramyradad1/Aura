import { DEFAULT_STORE_SETTINGS, StoreSettings } from '../config/store';


export interface WhatsAppOrderItem {
    name: string;
    quantity: number;
    price: number;
    size?: string;
}

export interface WhatsAppOrderPayload {
    orderNumber: string;
    items: WhatsAppOrderItem[];
    subtotal: number;
    shippingFee: number;
    discount?: number;
    total: number;
    couponCode?: string;
    customer: {
        firstName: string;
        lastName: string;
        phone: string;
        altPhone?: string;
        email?: string;
    };
    address: {
        street: string;
        apartment?: string;
        landmark?: string;
        city: string;
        governorate: string;
        postalCode?: string;
        country: string;
    };
    notes?: string;
}

/**
 * Generates a human-readable, well structured Arabic order summary for WhatsApp.
 * WhatsApp renders *text* as bold, so section titles use asterisks.
 *
 * Pass the live settings from `useStoreSettings()` so the store name and
 * currency configured in the admin panel are used.
 */
export function buildWhatsAppOrderMessage(
    order: WhatsAppOrderPayload,
    settings: StoreSettings = DEFAULT_STORE_SETTINGS
): string {
    const money = (value: number) => `${value.toLocaleString('en-US')} ${settings.currency}`;
    const { customer, address } = order;
    const fullName = `${customer.firstName} ${customer.lastName}`.trim();
    const date = new Date().toLocaleString('ar-EG', {
        dateStyle: 'full',
        timeStyle: 'short',
    });

    const lines: string[] = [];

    lines.push(`*🛍️ طلب جديد من ${settings.storeName}*`);

    lines.push(`رقم الطلب: *${order.orderNumber}*`);
    lines.push(`التاريخ: ${date}`);
    lines.push('');
    lines.push('━━━━━━━━━━━━━━━');
    lines.push('*🧾 تفاصيل الطلب*');

    order.items.forEach((item, index) => {
        const lineTotal = item.price * item.quantity;
        lines.push(`${index + 1}. *${item.name}*`);
        if (item.size) lines.push(`   • الحجم: ${item.size}`);
        lines.push(`   • الكمية: ${item.quantity}`);
        lines.push(`   • السعر: ${money(item.price)}`);
        lines.push(`   • الإجمالي: ${money(lineTotal)}`);
    });

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━');
    lines.push('*💰 الحساب*');
    lines.push(`المجموع الفرعي: ${money(order.subtotal)}`);
    if (order.discount && order.discount > 0) {
        lines.push(
            `الخصم${order.couponCode ? ` (${order.couponCode})` : ''}: -${money(order.discount)}`
        );
    }
    lines.push(`الشحن: ${money(order.shippingFee)}`);
    lines.push(`*الإجمالي النهائي: ${money(order.total)}*`);
    lines.push('طريقة الدفع: الدفع عند الاستلام');

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━');
    lines.push('*👤 بيانات العميل*');
    lines.push(`الاسم: ${fullName}`);
    lines.push(`الهاتف: ${customer.phone}`);
    if (customer.altPhone) lines.push(`هاتف احتياطي: ${customer.altPhone}`);
    if (customer.email) lines.push(`البريد الإلكتروني: ${customer.email}`);

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━');
    lines.push('*📍 عنوان التوصيل*');
    lines.push(`العنوان: ${address.street}`);
    if (address.apartment) lines.push(`شقة / دور: ${address.apartment}`);
    if (address.landmark) lines.push(`علامة مميزة: ${address.landmark}`);
    lines.push(`المدينة: ${address.city}`);
    lines.push(`المحافظة: ${address.governorate}`);
    if (address.postalCode) lines.push(`الرمز البريدي: ${address.postalCode}`);
    lines.push(`البلد: ${address.country}`);

    if (order.notes?.trim()) {
        lines.push('');
        lines.push('━━━━━━━━━━━━━━━');
        lines.push('*📝 ملاحظات*');
        lines.push(order.notes.trim());
    }

    lines.push('');
    lines.push('━━━━━━━━━━━━━━━');
    lines.push('برجاء تأكيد الطلب وموعد التوصيل. شكراً لكم 🌸');

    return lines.join('\n');
}

/**
 * Builds the wa.me deep link carrying the encoded order message, targeting the
 * WhatsApp number currently configured in the admin panel.
 */
export function buildWhatsAppOrderLink(
    order: WhatsAppOrderPayload,
    settings: StoreSettings = DEFAULT_STORE_SETTINGS
): string {
    const message = encodeURIComponent(buildWhatsAppOrderMessage(order, settings));
    return `https://wa.me/${settings.whatsappNumber}?text=${message}`;
}


/** Short, sortable, human friendly order reference. e.g. AURA-6X4K2P */
export function generateOrderNumber(): string {
    const stamp = Date.now().toString(36).toUpperCase().slice(-4);
    const rand = Math.random().toString(36).toUpperCase().slice(2, 4);
    return `AURA-${stamp}${rand}`;
}
