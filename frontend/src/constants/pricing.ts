import { PricingPlan } from '../types';

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Free',
    price: 0,
    interval: 'month',
    maxRequests: 5,
    maxFileSize: '10 MB',
    features: [
      '5 requests per day',
      'Max file size: 10 MB',
      'Basic file processing',
      'Email support',
    ],
  },
  {
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    maxRequests: 100,
    maxFileSize: '50 MB',
    features: [
      '100 requests per day',
      'Max file size: 50 MB',
      'All file processing tools',
      'Priority email support',
      'Batch processing',
    ],
  },
  {
    name: 'Pro',
    price: 29.99,
    interval: 'month',
    maxRequests: 1000,
    maxFileSize: '200 MB',
    features: [
      '1000 requests per day',
      'Max file size: 200 MB',
      'All premium features',
      '24/7 priority support',
      'Advanced batch processing',
      'API access',
      'Custom workflows',
    ],
  },
];
