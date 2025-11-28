# Qsyed - Subscription-Based SaaS Frontend

A modern, subscription-based SaaS frontend for document processing with Stripe integration.

## 🚀 Features

- **Landing Page** with pricing plans (Free, Pro $5/mo, Premium $10/mo)
- **Authentication** (Email/Password + Google OAuth)
- **Stripe Integration** for subscriptions
- **Dashboard** with plan-based feature gating
- **Subscription Management** (upgrade, cancel, billing portal)
- **Responsive Design** with Tailwind CSS

## 📋 Tech Stack

- React 18 + TypeScript
- Vite
- React Router
- Zustand (state management)
- Axios
- Stripe
- Tailwind CSS
- Lucide React (icons)
- React Hot Toast (notifications)

## 🛠️ Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure .env file
cp .env.example .env
# Edit .env with your API URL, Stripe key, Google OAuth client ID

# 3. Run development server
npm run dev
```

## 🔄 Complete User Flow

**Landing (/) → Pricing → Signup (/signup?plan=pro) → Stripe Checkout → Dashboard**

1. User selects plan on landing page
2. Redirected to signup with plan pre-selected
3. Creates account with email or Google
4. If paid plan: redirected to Stripe checkout
5. After payment: lands on dashboard with full access
6. System automatically detects subscription tier and gates features

## 🎯 Subscription Tiers

| Feature | Free | Pro ($5) | Premium ($10) |
|---------|------|----------|---------------|
| Documents/month | 5 | 100 | Unlimited |
| OCR | ❌ | ✅ | ✅ |
| Batch processing | ❌ | ✅ | ✅ |
| API access | ❌ | ❌ | ✅ |

## 🔌 Backend API Endpoints Required

```
# Auth
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
GET  /api/auth/google

# Subscription
GET  /api/subscription/status
POST /api/subscription/checkout
POST /api/subscription/portal
POST /api/subscription/cancel
POST /api/subscription/webhook

# Profile
GET    /api/profile
PUT    /api/profile
DELETE /api/profile
```

## 📁 Key Files

- `src/pages/Landing.tsx` - Landing page with pricing
- `src/pages/Dashboard.tsx` - Dashboard with feature gating
- `src/pages/Subscribe.tsx` - Stripe checkout flow
- `src/store/authStore.ts` - Authentication state
- `src/lib/api.ts` - API client with auth interceptors

## 🚀 Build & Deploy

```bash
npm run build
```

Deploy `dist/` folder to Vercel, Netlify, or any static hosting.

**Required environment variables in production:**
- `VITE_API_URL`
- `VITE_STRIPE_PUBLIC_KEY`
- `VITE_GOOGLE_CLIENT_ID`
