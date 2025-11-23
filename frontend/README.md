# Qsyed Frontend - File Processing Services

Modern React TypeScript frontend for Qsyed file processing services with integrated pricing plans.

## Features

- **Pricing Plans Integration**: Free, Basic, and Pro plans displayed on landing page and dashboard
- **User Plan Indicator**: Shows current plan (Free/Basic/Pro) when logged in
- **Navigation Menu**: Pricing section accessible from menu bar on both landing and dashboard
- **File Processing**: Upload and process files with 192+ tools
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Pricing Plans

| Plan | Price | Max Requests/Day | Max File Size |
|------|-------|------------------|---------------|
| Free | $0 | 5 | 10 MB |
| Basic | $9.99/month | 100 | 50 MB |
| Pro | $29.99/month | 1000 | 200 MB |

## Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will run on http://localhost:3001

## Project Structure

```
frontend/
├── src/
│   ├── api/              # API client and services
│   │   ├── client.ts     # Axios client with auth interceptors
│   │   ├── upload.ts     # File upload services
│   │   ├── tools.ts      # Tool processing services
│   │   ├── jobs.ts       # Job status polling
│   │   └── download.ts   # File download
│   ├── components/       # Reusable components
│   │   ├── Navbar.tsx    # Navigation with pricing link
│   │   └── Pricing.tsx   # Pricing plans display
│   ├── context/          # React contexts
│   │   └── AuthContext.tsx  # Auth & user plan management
│   ├── constants/        # App constants
│   │   └── pricing.ts    # Pricing plans configuration
│   ├── pages/            # Page components
│   │   ├── LandingPage.tsx  # Home with pricing section
│   │   ├── Dashboard.tsx    # Dashboard with plan indicator
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app with routing
│   └── main.tsx          # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Key Features

### 1. Pricing Plans Display
- Shown on landing page and accessible from navigation menu
- Three tiers: Free, Basic, Pro
- Visual indicators for current plan and featured plans

### 2. User Plan Indicator
- Displays current plan badge in navigation bar when logged in
- Shows "Free Plan" indicator prominently on dashboard
- Plan-specific limits displayed (requests/day, max file size)

### 3. Navigation Menu
- "Pricing" link in menu bar (landing & dashboard)
- Smooth scroll to pricing section
- User plan badge visible when authenticated

### 4. File Processing
- Upload files via drag-and-drop or file picker
- Select from 192+ processing tools
- Real-time progress tracking
- Auto-download on completion

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

## Available Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

The frontend integrates with the backend API for:

- File uploads (single & multiple)
- Tool processing (192 tools across 8 categories)
- Job status polling with progress updates
- File downloads
- User authentication
- Plan management

## Customization

### Modify Pricing Plans

Edit `src/constants/pricing.ts`:

```typescript
export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: 0,
    maxRequests: 5,
    maxFileSize: '10 MB',
    features: [...],
  },
  // Add more plans
];
```

### Add New Tools

Tools are automatically loaded from the backend API. No frontend changes needed.

## Authentication

The app uses JWT tokens stored in localStorage:
- `authToken`: JWT authentication token
- `user`: User object with plan information

Mock authentication is implemented for development. Replace with actual API calls in production.

## Deployment

```bash
# Build for production
npm run build

# The build folder will contain static files ready for deployment
# Deploy to Vercel, Netlify, or any static hosting service
```

## Backend API

This frontend requires the Qsyed backend API running on http://localhost:3000

See [API_DOCUMENTATION.md](../API_DOCUMENTATION.md) for complete API reference.

## License

MIT
