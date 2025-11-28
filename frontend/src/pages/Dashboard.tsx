import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import {
  Zap,
  LogOut,
  Crown,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  Lock,
  ArrowUpCircle,
  Check,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  minTier: 'free' | 'pro' | 'premium';
}

const tools: Tool[] = [
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF to DOCX',
    icon: FileText,
    category: 'PDF Tools',
    minTier: 'free',
  },
  {
    id: 'pdf-compress',
    name: 'PDF Compress',
    description: 'Reduce PDF file size',
    icon: Archive,
    category: 'PDF Tools',
    minTier: 'free',
  },
  {
    id: 'pdf-ocr',
    name: 'PDF OCR',
    description: 'Extract text from scanned PDFs',
    icon: FileText,
    category: 'PDF Tools',
    minTier: 'pro',
  },
  {
    id: 'batch-convert',
    name: 'Batch Convert',
    description: 'Convert multiple files at once',
    icon: FileText,
    category: 'Batch Tools',
    minTier: 'pro',
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Convert between image formats',
    icon: Image,
    category: 'Image Tools',
    minTier: 'free',
  },
  {
    id: 'video-converter',
    name: 'Video Converter',
    description: 'Convert video formats',
    icon: Film,
    category: 'Video Tools',
    minTier: 'premium',
  },
  {
    id: 'audio-converter',
    name: 'Audio Converter',
    description: 'Convert audio formats',
    icon: Music,
    category: 'Audio Tools',
    minTier: 'premium',
  },
  {
    id: 'api-access',
    name: 'API Access',
    description: 'Programmatic access to tools',
    icon: Settings,
    category: 'Developer',
    minTier: 'premium',
  },
];

const tierLevels = {
  free: 0,
  pro: 1,
  premium: 2,
};

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, logout, loadUser, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show success message if returning from Stripe checkout
    if (searchParams.get('checkout') === 'success') {
      toast.success('Subscription activated! Welcome to your new plan 🎉');
      // Clear query param
      navigate('/dashboard', { replace: true });
    }
  }, [searchParams, navigate]);

  useEffect(() => {
    const init = async () => {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      try {
        await loadUser();

        // Load subscription status
        await api.get('/api/subscription/status');
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isAuthenticated, loadUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleUpgrade = () => {
    navigate('/subscribe?plan=pro');
  };

  const handleManageSubscription = async () => {
    try {
      const response = await api.post('/api/subscription/portal');
      const { portalUrl } = response.data.data;
      window.location.href = portalUrl;
    } catch (error) {
      toast.error('Failed to open subscription portal');
    }
  };

  const canAccessTool = (tool: Tool): boolean => {
    if (!user) return false;
    const userTierLevel = tierLevels[user.subscriptionTier];
    const toolTierLevel = tierLevels[tool.minTier];
    return userTierLevel >= toolTierLevel;
  };

  const handleToolClick = (tool: Tool) => {
    if (!canAccessTool(tool)) {
      toast.error(`Upgrade to ${tool.minTier} plan to access this tool`);
      return;
    }

    // Navigate to tool (you'll implement these routes)
    navigate(`/tools/${tool.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const currentTier = user?.subscriptionTier || 'free';
  const tierColors = {
    free: 'bg-gray-100 text-gray-800',
    pro: 'bg-blue-100 text-blue-800',
    premium: 'bg-purple-100 text-purple-800',
  };

  const usageStats = {
    free: { used: 3, limit: 5 },
    pro: { used: 45, limit: 100 },
    premium: { used: 234, limit: null },
  };

  const stats = usageStats[currentTier];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Qsyed</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Current Plan Badge */}
              <div className={`px-4 py-2 rounded-full font-semibold flex items-center gap-2 ${tierColors[currentTier]}`}>
                {currentTier === 'premium' && <Crown className="w-4 h-4" />}
                {currentTier.toUpperCase()} PLAN
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">Choose a tool to get started</p>
        </div>

        {/* Usage Stats & Upgrade Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Usage Stats */}
          <div className="md:col-span-2 bg-white rounded-xl shadow p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Monthly Usage</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Documents Processed</span>
                  <span className="font-semibold">
                    {stats.used} {stats.limit ? `/ ${stats.limit}` : '(Unlimited)'}
                  </span>
                </div>
                {stats.limit && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(stats.used / stats.limit) * 100}%` }}
                    ></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upgrade Card */}
          {currentTier !== 'premium' && (
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow p-6 text-white">
              <Crown className="w-8 h-8 mb-3" />
              <h3 className="font-bold text-lg mb-2">Upgrade Now</h3>
              <p className="text-blue-100 text-sm mb-4">
                Unlock {currentTier === 'free' ? 'Pro' : 'Premium'} features
              </p>
              <button
                onClick={handleUpgrade}
                className="w-full py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold flex items-center justify-center gap-2"
              >
                <ArrowUpCircle className="w-4 h-4" />
                Upgrade Plan
              </button>
            </div>
          )}

          {/* Manage Subscription (for paid users) */}
          {currentTier !== 'free' && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Subscription</h3>
              <button
                onClick={handleManageSubscription}
                className="w-full py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Manage Subscription
              </button>
            </div>
          )}
        </div>

        {/* Tools Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Tools</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isLocked = !canAccessTool(tool);

              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool)}
                  className={`relative p-6 rounded-xl border-2 text-left transition ${
                    isLocked
                      ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                  }`}
                >
                  {isLocked && (
                    <div className="absolute top-3 right-3">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                    isLocked ? 'bg-gray-200' : 'bg-blue-100'
                  }`}>
                    <Icon className={`w-6 h-6 ${isLocked ? 'text-gray-400' : 'text-blue-600'}`} />
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{tool.description}</p>

                  {isLocked && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {tool.minTier} Plan Required
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Free Plan Limitations Notice */}
        {currentTier === 'free' && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">🚀 Upgrade to unlock more features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                100+ documents/month with Pro
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                OCR text extraction
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                Batch processing
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-600" />
                Priority support
              </li>
            </ul>
            <button
              onClick={handleUpgrade}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Upgrade to Pro - Only $5/month
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
