# 🚀 Getting Started with Qsyed Frontend

## ✅ What's Been Built

A complete subscription-based SaaS frontend with:
- **Landing page** with pricing plans (Free, Pro $5/mo, Premium $10/mo)
- **Authentication** (Email/Password + Google OAuth)
- **Stripe checkout** integration
- **Dashboard** with plan-based feature gating
- **Subscription management**

## 📋 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 3. Run Development Server

```bash
npm run dev
```

Frontend runs at: **http://localhost:5173**

## 🎯 Complete User Flow

### Step 1: Landing Page (/)
- User visits homepage
- Sees hero section and features
- Views 3 pricing plans:
  - **Free**: $0/month - 5 docs, basic tools
  - **Pro**: $5/month - 100 docs, OCR, batch processing
  - **Premium**: $10/month - Unlimited, API access

### Step 2: Click "Subscribe Now" on Pro Plan
- Redirected to `/signup?plan=pro`
- Sign up form shows selected plan badge
- User enters: Name, Email, Password

### Step 3: Create Account
Two options:
1. **Email/Password**: Fill form → Click "Create Account"
2. **Google OAuth**: Click "Sign up with Google"

### Step 4: Stripe Checkout (Paid Plans Only)
- After signup, redirected to `/subscribe?plan=pro`
- Shows plan details and price
- Click "Subscribe Now"
- Backend creates Stripe checkout session
- Redirected to Stripe hosted payment page

### Step 5: Payment
- User enters card details on Stripe
- After successful payment → redirected to `/dashboard?checkout=success`

### Step 6: Dashboard
- Success message: "Subscription activated! 🎉"
- Header shows "PRO PLAN" badge
- Usage stats displayed
- **Feature Gating in Action:**
  - Free tools: ✅ Accessible
  - Pro tools (OCR, Batch): ✅ Unlocked
  - Premium tools (Video, Audio, API): 🔒 Locked with "PREMIUM PLAN REQUIRED"

### Step 7: Manage Subscription
- Click "Manage Subscription"
- Redirected to Stripe billing portal
- Can update payment method, cancel subscription, view invoices

## 🔧 Backend Requirements

Your backend must implement these endpoints:

### Authentication
```
POST /api/auth/signup
  Body: { name, email, password }
  Returns: { user, token }

POST /api/auth/login
  Body: { email, password }
  Returns: { user, token }

GET /api/auth/me
  Headers: Authorization: Bearer {token}
  Returns: { user }

GET /api/auth/google
  Initiates Google OAuth flow
  Redirects back with token
```

### Subscription
```
GET /api/subscription/status
  Returns: { tier, status, currentPeriodEnd }

POST /api/subscription/checkout
  Body: { plan, successUrl, cancelUrl }
  Returns: { checkoutUrl }

POST /api/subscription/portal
  Returns: { portalUrl }

POST /api/subscription/cancel
  Returns: { success }

POST /api/subscription/webhook
  Stripe webhook endpoint
```

## 🧪 Testing the Complete Flow

### Test with Free Plan
```bash
1. Click "Start Free" on landing page
2. Sign up with email
3. Redirected directly to dashboard (no payment)
4. Try clicking on OCR tool → Shows "Upgrade to Pro required"
```

### Test with Pro Plan
```bash
1. Click "Subscribe Now" on Pro plan
2. Sign up with email
3. On checkout page, use Stripe test card:
   Card: 4242 4242 4242 4242
   Expiry: Any future date
   CVC: Any 3 digits
4. Complete payment
5. Redirected to dashboard
6. OCR and Batch tools now unlocked ✅
7. Premium tools still locked 🔒
```

### Test Google OAuth
```bash
1. Click "Sign up with Google"
2. Backend handles OAuth flow
3. After Google auth, redirected back to frontend
4. User logged in automatically
```

## 🎨 Feature Gating Logic

### How It Works

In `Dashboard.tsx`, each tool has a `minTier`:

```typescript
const tools = [
  { id: 'pdf-compress', minTier: 'free' },   // Free users can access
  { id: 'pdf-ocr', minTier: 'pro' },         // Pro+ users can access
  { id: 'api-access', minTier: 'premium' },  // Premium users only
];
```

Function checks if user can access:

```typescript
function canAccessTool(tool) {
  const userLevel = tierLevels[user.subscriptionTier]; // free=0, pro=1, premium=2
  const toolLevel = tierLevels[tool.minTier];
  return userLevel >= toolLevel;
}
```

### Visual Indicators
- 🔒 Locked tools show lock icon
- Grayed out appearance
- "UPGRADE REQUIRED" badge
- Clicking locked tool → Toast error message

## 📊 Subscription Management

### Upgrade Flow
```bash
1. Free user clicks "Upgrade to Pro" button
2. Redirected to /subscribe?plan=pro
3. Stripe checkout flow
4. After payment → Dashboard refreshes with new tier
5. Previously locked tools now accessible
```

### Manage Subscription
```bash
1. Paid user clicks "Manage Subscription"
2. Backend calls POST /api/subscription/portal
3. Stripe returns portal URL
4. User redirected to Stripe billing portal
5. Can update card, cancel subscription, download invoices
```

### Cancel Subscription
```bash
1. In Stripe portal, click "Cancel subscription"
2. Subscription canceled (access until period end)
3. Backend receives webhook from Stripe
4. Updates user's subscription status
5. Next time user logs in → access reverted to Free
```

## 🔐 Authentication Details

### Token Storage
- JWT token stored in localStorage
- Axios interceptor automatically adds to all requests:
  ```typescript
  headers: { Authorization: `Bearer ${token}` }
  ```

### Auto-Logout on 401
- If backend returns 401 Unauthorized
- Axios interceptor catches it
- Removes token from localStorage
- Redirects to /login

### Protected Routes
- `/dashboard` and `/subscribe` are protected
- `ProtectedRoute` component checks `isAuthenticated`
- If not logged in → Redirect to `/login`

## 🌍 Environment Variables

### Development
```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
```

### Production
```env
VITE_API_URL=https://api.yourapp.com
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_GOOGLE_CLIENT_ID=...apps.googleusercontent.com
```

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

Output: `dist/` folder

### Deploy to Vercel
```bash
vercel
```

Set environment variables in Vercel dashboard.

### Deploy to Netlify
```bash
netlify deploy --prod
```

Set environment variables in Netlify dashboard.

## 📝 Next Steps

### 1. Set Up Backend
- Implement required API endpoints
- Configure Stripe webhook
- Set up Google OAuth credentials

### 2. Configure Stripe
- Get publishable key from Stripe Dashboard
- Create Pro ($5) and Premium ($10) products
- Set up webhook endpoint

### 3. Configure Google OAuth
- Create project in Google Cloud Console
- Enable Google+ API
- Add authorized redirect URIs
- Get client ID

### 4. Test Complete Flow
- Test free signup
- Test paid subscription with test card
- Test feature gating
- Test subscription management

### 5. Go Live
- Update to production Stripe keys
- Update to production API URL
- Deploy frontend
- Deploy backend
- Test with real payment

## 🐛 Troubleshooting

### "Network Error" when signing up
- Check backend is running
- Verify CORS enabled on backend
- Check `VITE_API_URL` in `.env`

### Stripe checkout not loading
- Verify Stripe public key is correct
- Check backend creates valid checkout session
- Ensure `successUrl` and `cancelUrl` are correct

### Google OAuth not working
- Check redirect URI in Google Cloud Console
- Verify client ID is correct
- Ensure backend handles `/api/auth/google`

### Features not unlocking after payment
- Check backend webhook receives Stripe events
- Verify `user.subscriptionTier` is updated correctly
- Check `/api/subscription/status` endpoint

## 📚 Documentation

- **Frontend README**: `frontend/README.md`
- **Backend Endpoints**: See backend team for API docs
- **Stripe Docs**: https://stripe.com/docs
- **Google OAuth**: https://developers.google.com/identity

## ✅ Checklist

- [ ] Backend API running on port 3000
- [ ] Stripe account created
- [ ] Google OAuth credentials obtained
- [ ] Environment variables configured
- [ ] Frontend running on port 5173
- [ ] Can sign up with email
- [ ] Can sign up with Google
- [ ] Can subscribe to Pro plan
- [ ] Payment redirects back to dashboard
- [ ] Feature gating works correctly
- [ ] Can manage subscription
- [ ] Can cancel subscription

---

**Need help?** Check the README or contact the development team.
