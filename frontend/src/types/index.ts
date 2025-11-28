export interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  subscriptionTier: 'free' | 'pro' | 'premium';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'none';
  createdAt: string;
}

export interface SubscriptionStatus {
  tier: 'free' | 'pro' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'none';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface PricingPlan {
  id: 'free' | 'pro' | 'premium';
  name: string;
  price: number;
  interval: 'month';
  features: string[];
  popular?: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
