import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Loader, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const planDetails = {
  pro: {
    name: 'Pro',
    price: 5,
    features: [
      '100 documents per month',
      'All conversion tools',
      'OCR support',
      'Priority email support',
      '50 MB file size limit',
      'Batch processing (up to 5 files)',
      'Fast processing speed',
    ],
  },
  premium: {
    name: 'Premium',
    price: 10,
    features: [
      'Unlimited documents',
      'All conversion tools',
      'Advanced OCR (12 languages)',
      'Priority support + Live chat',
      '200 MB file size limit',
      'Unlimited batch processing',
      'Fastest processing speed',
      'API access',
      'Custom integrations',
    ],
  },
};

export function Subscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const plan = searchParams.get('plan') as 'pro' | 'premium';

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!plan || (plan !== 'pro' && plan !== 'premium')) {
      toast.error('Invalid plan selected');
      navigate('/');
    }
  }, [plan, navigate]);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // Call backend to create Stripe checkout session
      const response = await api.post('/api/subscription/checkout', {
        plan,
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
        cancelUrl: `${window.location.origin}/subscribe?plan=${plan}`,
      });

      const { checkoutUrl } = response.data.data;

      // Redirect to Stripe checkout
      window.location.href = checkoutUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start checkout');
      setLoading(false);
    }
  };

  if (!plan || !planDetails[plan]) {
    return null;
  }

  const selectedPlan = planDetails[plan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Subscribe to {selectedPlan.name}
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Upgrade your account to unlock more features
        </p>

        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-gray-900">
              ${selectedPlan.price}
            </span>
            <span className="text-gray-600">/month</span>
          </div>

          <ul className="space-y-3">
            {selectedPlan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Redirecting to Stripe...
            </>
          ) : (
            'Subscribe Now'
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          You'll be redirected to Stripe for secure payment
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full mt-4 py-3 text-gray-600 hover:text-gray-900 transition"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
