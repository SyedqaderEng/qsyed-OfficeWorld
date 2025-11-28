import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react';

const pricingPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'month',
    description: 'Perfect for trying out our platform',
    features: [
      '5 documents per month',
      'Basic file conversions',
      'Email support',
      '10 MB file size limit',
    ],
    limitations: [
      'No OCR support',
      'No batch processing',
      'Standard speed',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 5,
    interval: 'month',
    description: 'For professionals who need more',
    features: [
      '100 documents per month',
      'All conversion tools',
      'OCR support',
      'Priority email support',
      '50 MB file size limit',
      'Batch processing (up to 5 files)',
      'Fast processing speed',
    ],
    popular: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 10,
    interval: 'month',
    description: 'For power users and teams',
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
];

export function Landing() {
  const navigate = useNavigate();

  const handleGetStarted = (planId: string) => {
    // Navigate to signup with selected plan
    navigate(`/signup?plan=${planId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Qsyed</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
            <button
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Transform Documents
            <span className="block text-blue-600">In Seconds</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Convert, compress, and manipulate over 192 file formats with our powerful cloud-based tools.
            No software installation required.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleGetStarted('free')}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-lg font-semibold shadow-lg hover:shadow-xl"
            >
              Start Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-900 rounded-lg hover:bg-gray-50 transition border-2 border-gray-200 text-lg font-semibold"
            >
              View Pricing
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">192+</div>
            <div className="text-gray-600">File Tools</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">1M+</div>
            <div className="text-gray-600">Files Processed</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">99.9%</div>
            <div className="text-gray-600">Uptime</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Qsyed?</h2>
            <p className="text-xl text-gray-600">Everything you need for document processing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600">
                Process documents in seconds with our optimized cloud infrastructure
              </p>
            </div>

            <div className="p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your files are encrypted and automatically deleted after processing
              </p>
            </div>

            <div className="p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enterprise Grade</h3>
              <p className="text-gray-600">
                Built for scale with 99.9% uptime and premium support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that's right for you</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-2xl p-8 relative ${
                  plan.popular
                    ? 'bg-blue-600 text-white shadow-2xl scale-105 border-4 border-blue-400'
                    : 'bg-white border-2 border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <h3 className={`text-2xl font-bold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name}
                </h3>
                <p className={`mb-4 ${plan.popular ? 'text-blue-100' : 'text-gray-600'}`}>
                  {plan.description}
                </p>

                <div className="mb-6">
                  <span className="text-5xl font-bold">${plan.price}</span>
                  <span className={plan.popular ? 'text-blue-100' : 'text-gray-600'}>
                    /{plan.interval}
                  </span>
                </div>

                <button
                  onClick={() => handleGetStarted(plan.id)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition mb-6 ${
                    plan.popular
                      ? 'bg-white text-blue-600 hover:bg-gray-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {plan.price === 0 ? 'Start Free' : 'Subscribe Now'}
                </button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-blue-200' : 'text-green-600'}`} />
                      <span className={plan.popular ? 'text-blue-50' : 'text-gray-700'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who trust Qsyed for their document processing needs
          </p>
          <button
            onClick={() => handleGetStarted('free')}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition text-lg font-semibold shadow-xl inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold text-white">Qsyed</span>
            </div>
            <p className="text-sm">
              © 2025 Qsyed. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
