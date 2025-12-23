export type Lang = 'vi' | 'en';

export function getClientLang(): Lang {
  if (typeof document === 'undefined') return 'vi';
  const m = document.cookie.match(/(?:^|; )lang=([^;]+)/);
  const v = m ? decodeURIComponent(m[1]) : null;
  return v === 'en' || v === 'vi' ? v : 'vi';
}

export function getClientDict(lang: Lang = getClientLang()) {
  const common = {
    appName: 'Shoople',
    prev: lang === 'en' ? 'Prev' : 'Trước',
    next: lang === 'en' ? 'Next' : 'Sau',
  };
  if (lang === 'en') {
    return {
      ...common,
      nav: {
        shops: 'Shops',
        orders: 'Orders',
        cart: 'Cart',
        account: 'Account',
        shopManage: 'Shop Management',
        admin: 'Admin',
        login: 'Log in',
        logout: 'Log out',
      },
      search: { placeholder: 'Search products', button: 'Search' },
      product: { soldBy: 'Sold by', addToCart: 'Add to cart' },
      cart: {
        title: 'Cart',
        empty: 'Your cart is empty.',
        product: 'Product',
        qty: 'Qty',
        price: 'Price',
        total: 'Total',
        checkout: 'Checkout',
      },
      orders: { title: 'Orders', view: 'View' },
      adminButtons: {
        create: 'Create',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
      },
      forms: {
        title: 'Title',
        price: 'Price (VND)',
        description: 'Description',
        shop: 'Shop',
        selectShop: 'Select a shop',
      },
      auth: {
        welcome: 'Welcome back',
        signInSubtitle: 'Sign in to your account.',
        email: 'Email',
        password: 'Password',
        continue: 'Continue',
        signupPrompt: `Don't have an account? Sign up`,
        createTitle: 'Create your account',
        quickSecure: "It's quick and secure.",
        name: 'Name',
        confirmPassword: 'Confirm password',
        pwMatch: 'Passwords match',
        pwNoMatch: 'Passwords do not match',
        signup: 'Sign up',
        loginPrompt: 'Already have an account? Sign in',
      },
      home: { by: 'by', more: 'More', loading: 'Loading…' },
      messages: { saved: 'Saved', failed: 'Failed', deleteConfirm: 'Delete this product?' },
    } as const;
  }
  return {
    ...common,
    nav: {
      shops: 'Cửa hàng',
      orders: 'Đơn hàng',
      cart: 'Giỏ hàng',
      account: 'Tài khoản',
      shopManage: 'Quản lý shop',
      admin: 'Quản trị',
      login: 'Đăng nhập',
      logout: 'Đăng xuất',
    },
    search: { placeholder: 'Tìm kiếm sản phẩm', button: 'Tìm' },
    product: { soldBy: 'Bán bởi', addToCart: 'Thêm vào giỏ' },
    cart: {
      title: 'Giỏ hàng',
      empty: 'Giỏ hàng trống.',
      product: 'Sản phẩm',
      qty: 'Số lượng',
      price: 'Giá',
      total: 'Tổng',
      checkout: 'Thanh toán',
    },
    orders: { title: 'Đơn hàng', view: 'Xem' },
    adminButtons: { create: 'Tạo', edit: 'Sửa', delete: 'Xóa', save: 'Lưu', cancel: 'Hủy' },
    forms: {
      title: 'Tiêu đề',
      price: 'Giá (VND)',
      description: 'Mô tả',
      shop: 'Cửa hàng',
      selectShop: 'Chọn cửa hàng',
    },
    auth: {
      welcome: 'Chào mừng trở lại',
      signInSubtitle: 'Đăng nhập vào tài khoản của bạn.',
      email: 'Email',
      password: 'Mật khẩu',
      continue: 'Tiếp tục',
      signupPrompt: 'Chưa có tài khoản? Đăng ký',
      createTitle: 'Tạo tài khoản',
      quickSecure: 'Nhanh chóng và bảo mật.',
      name: 'Họ tên',
      confirmPassword: 'Xác nhận mật khẩu',
      pwMatch: 'Khớp mật khẩu',
      pwNoMatch: 'Không khớp mật khẩu',
      signup: 'Đăng ký',
      loginPrompt: 'Đã có tài khoản? Đăng nhập',
    },
    home: { by: 'bởi', more: 'Xem thêm', loading: 'Đang tải…' },
    messages: { saved: 'Đã lưu', failed: 'Thất bại', deleteConfirm: 'Xóa sản phẩm này?' },
  } as const;
}
