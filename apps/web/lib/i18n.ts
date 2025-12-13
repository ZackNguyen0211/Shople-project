import { cookies } from 'next/headers';

export type Lang = 'vi' | 'en';

export function getLang(): Lang {
  const v = cookies().get('lang')?.value;
  return v === 'en' || v === 'vi' ? v : 'vi';
}

export type Dict = ReturnType<typeof getDict>;

export function getDict(lang: Lang = getLang()) {
  const common = {
    appName: 'Shoople',
    prev: lang === 'en' ? 'Prev' : 'Trước',
    next: lang === 'en' ? 'Next' : 'Sau',
  };
  const vi = {
    ...common,
    nav: {
      shops: 'Cửa hàng',
      orders: 'Đơn hàng',
      cart: 'Giỏ hàng',
      account: 'Tài khoản',
      shopManage: 'Quản lý shop',
      admin: 'Quản trị',
      logout: 'Đăng xuất',
    },
    search: { placeholder: 'Tìm kiếm sản phẩm', button: 'Tìm' },
    footer: { links: 'Liên kết', home: 'Trang chủ', shops: 'Cửa hàng', orders: 'Đơn hàng', contact: 'Liên hệ', tagline: 'Dự án thương mại điện tử demo.' },
    home: { welcome: 'Chào mừng đến Shoople', categories: 'Danh mục' },
    categories: [
      { name: 'Thời Trang Nam', q: 'men' },
      { name: 'Điện Thoại & Phụ Kiện', q: 'phone' },
      { name: 'Thiết Bị Điện Tử', q: 'electronics' },
      { name: 'Máy Tính & Laptop', q: 'laptop' },
      { name: 'Máy Ảnh & Quay Phim', q: 'camera' },
      { name: 'Đồng Hồ', q: 'watch' },
      { name: 'Giày Dép Nam', q: 'shoes men' },
      { name: 'Gia Dụng', q: 'home' },
      { name: 'Thể Thao & Du Lịch', q: 'sport' },
      { name: 'Ô Tô & Xe Máy', q: 'auto' },
      { name: 'Thời Trang Nữ', q: 'women' },
      { name: 'Mẹ & Bé', q: 'baby' },
      { name: 'Nhà Cửa & Đời Sống', q: 'living' },
      { name: 'Sắc Đẹp', q: 'beauty' },
      { name: 'Sức Khỏe', q: 'health' },
      { name: 'Giày Dép Nữ', q: 'shoes women' },
      { name: 'Túi Ví Nữ', q: 'bag' },
      { name: 'Trang Sức', q: 'jewelry' },
      { name: 'Bách Hóa', q: 'grocery' },
      { name: 'Sách', q: 'book' },
    ],
    product: { soldBy: 'Bán bởi', addToCart: 'Thêm vào giỏ' },
    cart: { title: 'Giỏ hàng', empty: 'Giỏ hàng trống.', product: 'Sản phẩm', qty: 'Số lượng', price: 'Giá', total: 'Tổng', checkout: 'Thanh toán' },
    orders: { title: 'Đơn hàng', view: 'Xem', status: 'Trạng thái', total: 'Tổng', none: 'Bạn chưa có đơn hàng nào.' },
    orderDetail: { title: (id: number) => `Đơn hàng #${id}`, status: 'Trạng thái', productId: 'Mã sản phẩm', qty: 'Số lượng', price: 'Giá' },
    checkout: { title: 'Thanh toán', payNow: 'Thanh toán ngay', backToCart: 'Quay lại giỏ hàng', note: 'Trang thanh toán demo (sẽ tích hợp sau).' },
    searchPage: { title: 'Tìm kiếm' },
    filters: { allStatuses: 'Tất cả trạng thái', newest: 'Mới nhất', oldest: 'Cũ nhất', apply: 'Lọc' },
    adminPage: { title: 'Bảng điều khiển quản trị', revenue: 'Tổng doanh thu', users: 'Người dùng', shops: 'Cửa hàng', products: 'Sản phẩm', recentOrders: 'Đơn hàng gần đây', noRecent: 'Không có đơn hàng.' },
    adminButtons: { users: 'Quản lý người dùng', shops: 'Quản lý cửa hàng', products: 'Quản lý sản phẩm', orders: 'Quản lý đơn hàng' },
    tables: { id: 'ID', items: 'Mặt hàng', total: 'Tổng', status: 'Trạng thái', user: 'Người dùng', shop: 'Cửa hàng', title: 'Tiêu đề', price: 'Giá', actions: '' },
    pagination: { page: (p: number, tp: number) => `Trang ${p} / ${tp}` },
    shopsList: { title: 'Cửa hàng', viewProducts: 'Xem sản phẩm' },
    shopManage: { title: 'Quản lý shop', yourShops: 'Shop của bạn', orders: 'Đơn hàng', addProduct: 'Thêm sản phẩm mới', none: 'Không có đơn hàng.' },
  } as const;

  const en = {
    ...common,
    nav: {
      shops: 'Shops',
      orders: 'Orders',
      cart: 'Cart',
      account: 'Account',
      shopManage: 'Shop Management',
      admin: 'Admin',
      logout: 'Log out',
    },
    search: { placeholder: 'Search products', button: 'Search' },
    footer: { links: 'Links', home: 'Home', shops: 'Shops', orders: 'Orders', contact: 'Contact', tagline: 'A simple demo e-commerce project.' },
    home: { welcome: 'Welcome to Shoople', categories: 'Categories' },
    categories: [
      { name: 'Men Fashion', q: 'men' },
      { name: 'Phones & Accessories', q: 'phone' },
      { name: 'Electronics', q: 'electronics' },
      { name: 'Computers & Laptops', q: 'laptop' },
      { name: 'Cameras & Video', q: 'camera' },
      { name: 'Watches', q: 'watch' },
      { name: 'Men Shoes', q: 'shoes men' },
      { name: 'Home & Kitchen', q: 'home' },
      { name: 'Sports & Travel', q: 'sport' },
      { name: 'Auto & Motor', q: 'auto' },
      { name: 'Women Fashion', q: 'women' },
      { name: 'Mom & Baby', q: 'baby' },
      { name: 'Home Living', q: 'living' },
      { name: 'Beauty', q: 'beauty' },
      { name: 'Health', q: 'health' },
      { name: 'Women Shoes', q: 'shoes women' },
      { name: 'Bags', q: 'bag' },
      { name: 'Jewelry', q: 'jewelry' },
      { name: 'Groceries', q: 'grocery' },
      { name: 'Books', q: 'book' },
    ],
    product: { soldBy: 'Sold by', addToCart: 'Add to cart' },
    cart: { title: 'Cart', empty: 'Your cart is empty.', product: 'Product', qty: 'Qty', price: 'Price', total: 'Total', checkout: 'Checkout' },
    orders: { title: 'Orders', view: 'View', status: 'Status', total: 'Total', none: 'You have no orders yet.' },
    orderDetail: { title: (id: number) => `Order #${id}`, status: 'Status', productId: 'Product ID', qty: 'Qty', price: 'Price' },
    checkout: { title: 'Checkout', payNow: 'Pay now', backToCart: 'Back to cart', note: 'Payment placeholder (integrate later).' },
    searchPage: { title: 'Search' },
    filters: { allStatuses: 'All statuses', newest: 'Newest first', oldest: 'Oldest first', apply: 'Apply' },
    adminPage: { title: 'Admin Dashboard', revenue: 'Total Revenue', users: 'Users', shops: 'Shops', products: 'Products', recentOrders: 'Recent Orders', noRecent: 'No recent orders.' },
    adminButtons: { users: 'Manage Users', shops: 'Manage Shops', products: 'Manage Products', orders: 'Manage Orders' },
    tables: { id: 'ID', items: 'Items', total: 'Total', status: 'Status', user: 'User', shop: 'Shop', title: 'Title', price: 'Price', actions: '' },
    pagination: { page: (p: number, tp: number) => `Page ${p} / ${tp}` },
    shopsList: { title: 'Shops', viewProducts: 'View products' },
    shopManage: { title: 'Shop Management', yourShops: 'Your Shops', orders: 'Orders', addProduct: 'Add new product', none: 'No orders found.' },
  } as const;

  return lang === 'en' ? en : vi;
}