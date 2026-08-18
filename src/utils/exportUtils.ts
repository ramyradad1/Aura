/**
 * Utilities for exporting data to CSV with UTF-8 BOM support
 * so Arabic characters display correctly in Microsoft Excel & Google Sheets.
 */

export function downloadCSV(filename: string, rows: (string | number)[][]) {
  // UTF-8 BOM \uFEFF ensures Excel renders Arabic properly
  const bom = '\uFEFF';
  const csvContent = rows
    .map(row =>
      row
        .map(cell => {
          const str = cell === null || cell === undefined ? '' : String(cell);
          // Escape double quotes
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(',')
    )
    .join('\r\n');

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportOrdersToCSV(orders: any[]) {
  const headers = [
    'رقم الطلب',
    'تاريخ الطلب',
    'اسم العميل',
    'رقم الهاتف',
    'المحافظة',
    'العنوان التفصيلي',
    'المنتجات المطلوبة',
    'الكوبون المستخدم',
    'قيمة الخصم',
    'رسوم الشحن',
    'المبلغ الإجمالي',
    'حالة الطلب',
    'ملاحظات إضافية'
  ];

  const rows = orders.map(order => {
    const itemsSummary = (order.items || [])
      .map((item: any) => `${item.name || ''} (${item.size || '100ml'}) x${item.quantity || 1}`)
      .join(' | ');

    const dateStr = order.createdAt
      ? new Date(order.createdAt).toLocaleString('ar-EG')
      : '';

    return [
      order.id || '',
      dateStr,
      order.customerName || order.shippingAddress?.fullName || '',
      order.customerPhone || order.shippingAddress?.phone || '',
      order.shippingAddress?.city || order.customerCity || '',
      order.shippingAddress?.address || order.customerAddress || '',
      itemsSummary,
      order.couponCode || '',
      order.discount ? `${order.discount} ج.م` : '0',
      order.shippingFee ? `${order.shippingFee} ج.م` : '0',
      order.totalAmount || order.total || 0,
      order.status || 'pending',
      order.notes || ''
    ];
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(`aura_orders_${timestamp}.csv`, [headers, ...rows]);
}

export function exportProductsToCSV(perfumes: any[]) {
  const headers = [
    'معرف العطر (ID)',
    'اسم العطر',
    'الاسم بالإنجليزية',
    'مستوحى من',
    'الفئة',
    'السعر (ج.م)',
    'المخزون الحالي',
    'الأحجام المتاحة',
    'الافتتاحية (Top)',
    'القلب (Heart)',
    'القاعدة (Base)',
    'الوصف'
  ];

  const rows = perfumes.map(p => {
    const sizesStr = Array.isArray(p.sizes) ? p.sizes.join(', ') : '50ml, 100ml';
    return [
      p.id || '',
      p.name || '',
      p.nameEn || '',
      p.inspiredBy || '',
      p.category || '',
      p.price || 0,
      p.stock !== undefined ? p.stock : 'غير محدد',
      sizesStr,
      p.notes?.top || '',
      p.notes?.middle || '',
      p.notes?.base || '',
      p.description || ''
    ];
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  downloadCSV(`aura_products_${timestamp}.csv`, [headers, ...rows]);
}
