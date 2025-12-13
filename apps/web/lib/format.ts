export function formatVND(value: number) {
  try {
    return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  } catch {
    return `${value} ₫`;
  }
}

export function statusLabel(status: string, lang: 'vi' | 'en' = 'vi') {
  if (lang === 'en') {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'PAID':
        return 'Paid';
      case 'SHIPPED':
        return 'Shipped';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  }
  switch (status) {
    case 'PENDING':
      return 'Chờ xử lý';
    case 'PAID':
      return 'Đã thanh toán';
    case 'SHIPPED':
      return 'Đã giao';
    case 'CANCELLED':
      return 'Đã hủy';
    default:
      return status;
  }
}
