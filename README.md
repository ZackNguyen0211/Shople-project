# 🛍️ Shople - E-commerce Platform

A modern, full-stack e-commerce platform built with **Next.js 14**, **React 18**, and **Supabase**. Shople provides a complete shopping experience with product catalog, shopping cart, checkout, order management, and multi-vendor shop support.

**[Live Demo](https://shople.vercel.app)** | **[GitHub](https://github.com/ZackNguyen0211/Shople-project)**

## ✨ Features

- 🛒 **Complete E-commerce**: Product catalog, shopping cart, checkout, invoices
- 🏪 **Multi-vendor**: Shop owners can list and manage products
- 👥 **Admin Dashboard**: Manage users, products, orders, and shop requests
- 🔐 **Secure Auth**: JWT-based authentication with HTTP-only cookies
- 🌐 **Multi-language**: Internationalization support (i18n)
- 📱 **Responsive Design**: Mobile-friendly interface
- 🖼️ **Image Management**: Upload and optimize product images
- ⚡ **Performance**: Server-side rendering with Next.js
- 🔔 **Real-time Notifications**: Notify users of order updates

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Backend** | Next.js API Routes, Node.js |
| **Database** | Supabase (PostgreSQL), Prisma |
| **Storage** | Supabase Storage |
| **Auth** | JWT, bcryptjs, HTTP-only cookies |
| **Deployment** | Vercel |
| **DevTools** | ESLint, Prettier, TypeScript |

## Prerequisites

- **Node.js** 18.17+ (Next.js 14 requirement)
- **npm** 9+ (comes with recent Node)
- **Supabase** account (free tier available at [supabase.com](https://supabase.com))

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/ZackNguyen0211/Shople-project.git
cd Shople-project
npm install
```

### 2. Setup Supabase
- Create a free account at [supabase.com](https://supabase.com)
- Create a new project
- Run the schema: Copy contents from `supabase/schema.sql` into SQL editor
- (Optional) Seed data: Run `supabase/seed.sql`

### 3. Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Fill in your values:
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
API_JWT_SECRET=your-strong-secret
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📋 Environment Variables

See `.env.example` for all required variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Supabase project URL | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `SUPABASE_BUCKET` | S3 bucket name for images | ⚠️ (defaults to `product-images`) |
| `API_JWT_SECRET` | Secret for JWT signing | ✅ |
| `API_COOKIE_NAME` | Auth cookie name | ⚠️ (defaults to `shoople_token`) |
| `API_JWT_EXPIRES_IN` | Token expiration time | ⚠️ (defaults to `7d`) |

**Note:** The service role key is required for server-side database access. Keep it secret and never expose it in client-side code.

## 📁 Project Structure

```
Shople-project/
├── apps/
│   └── web/                    # Main Next.js application
│       ├── app/               # Next.js app directory
│       │   ├── (auth)/        # Authentication pages (login, register)
│       │   ├── (site)/        # Public pages (home, products, cart)
│       │   ├── admin/         # Admin dashboard
│       │   └── api/           # API routes
│       ├── components/        # Reusable React components
│       ├── lib/              # Utilities (auth, db, i18n, etc.)
│       ├── middleware.ts     # Next.js middleware
│       └── package.json
├── supabase/
│   ├── schema.sql           # Database schema
│   └── seed.sql            # Sample data
├── .env.example            # Environment variables template
├── README.md              # This file
└── package.json          # Root package config
```

## 🔐 Database Schema

Key tables:
- **users** - User accounts with authentication
- **shops** - Seller shops
- **products** - Product listings
- **product_images** - Product image references
- **carts** - Shopping carts
- **cart_items** - Items in cart
- **invoices** - Order invoices
- **shop_requests** - Shop creation requests
- **notifications** - User notifications

See `supabase/schema.sql` for the complete schema.

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server (port 3000)

# Production
npm run build           # Build for production
npm run start -w @shoople/web  # Start production server

# Code quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier

# Database utilities
npm run seed-images                    # Populate product images
npm run seed-images:category          # Seed by category
npm run cleanup-images                # Clean up storage
npm run reseed-images                 # Full reseed
```

## 🛣️ Key Routes

### Public Routes
- `/` - Homepage with featured products
- `/product/[id]` - Product details
- `/search` - Product search
- `/shop-lists` - Browse shops

### Authentication
- `/login` - User login
- `/register` - User registration
- `/register-shop` - Shop registration

### User Routes
- `/account` - User profile
- `/cart` - Shopping cart
- `/checkout` - Checkout process
- `/checkout/success` - Order confirmation
- `/orders` - Order history
- `/orders/[id]` - Order details

### Admin Routes (Restricted)
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/shops` - Shop management
- `/admin/users` - User management
- `/admin/shop-requests` - Approve shop requests

## 🔒 Security Features

- ✅ **HTTP-only Cookies** - Tokens stored securely
- ✅ **JWT Authentication** - Stateless auth tokens
- ✅ **Password Hashing** - bcryptjs for secure passwords
- ✅ **Service Role Keys** - Server-only database access
- ✅ **API Rate Limiting** - Prevent abuse
- ⚠️ **RLS Disabled** - Enable for production (see schema.sql comment)

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and connect your repository
3. Add environment variables in Vercel dashboard
4. Deploy with one click!

**Note:** The project includes `vercel.json` for automatic configuration.

### Deploy to Other Platforms

The project also works on:
- ✅ Heroku
- ✅ Railway
- ✅ Render
- ✅ Self-hosted servers

Just ensure Node.js 18+ is available and configure the environment variables.

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please follow the code style (ESLint + Prettier) and add tests when possible.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 📧 Contact & Support

- **GitHub Issues** - For bugs and feature requests
- **Email** - Contact via GitHub profile
- **Discussions** - GitHub Discussions for questions

---

**Made with ❤️ by Zack Nguyen**

⭐ If you find this project helpful, please consider giving it a star on GitHub!
