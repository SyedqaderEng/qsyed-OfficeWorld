import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('🔧 API Client Configuration:');
console.log('   Base URL:', API_BASE_URL);
console.log('   Timeout: 30000ms');
console.log('---');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies
});

// Request Interceptor - Log all outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const timestamp = new Date().toISOString();

    console.log('\n🚀 API REQUEST:', timestamp);
    console.log('   Method:', config.method?.toUpperCase());
    console.log('   URL:', `${config.baseURL}${config.url}`);
    console.log('   Headers:', {
      'Content-Type': config.headers['Content-Type'],
      'Authorization': config.headers['Authorization'] ? '***Bearer Token***' : 'None'
    });

    if (config.data) {
      console.log('   Data:', config.data);
    }
    if (config.params) {
      console.log('   Params:', config.params);
    }

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('   ✅ Auth token attached');
    } else {
      console.log('   ⚠️  No auth token found');
    }

    console.log('---');

    return config;
  },
  (error) => {
    console.error('\n❌ REQUEST SETUP FAILED:');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    console.error('---');
    return Promise.reject(error);
  }
);

// Response Interceptor - Log all responses and errors
apiClient.interceptors.response.use(
  (response) => {
    const timestamp = new Date().toISOString();

    console.log('\n✅ API RESPONSE SUCCESS:', timestamp);
    console.log('   Status:', response.status, response.statusText);
    console.log('   URL:', response.config.url);
    console.log('   Data:', response.data);
    console.log('---');

    return response;
  },
  (error) => {
    const timestamp = new Date().toISOString();

    console.log('\n❌ API REQUEST FAILED:', timestamp);
    console.log('   URL:', error.config?.url || 'Unknown');
    console.log('   Method:', error.config?.method?.toUpperCase() || 'Unknown');

    // Network error (no response received)
    if (!error.response) {
      console.error('   Error Type: NETWORK ERROR');
      console.error('   Message:', error.message);
      console.error('   Code:', error.code);
      console.error('');
      console.error('   🔍 Debugging Info:');
      console.error('   ├─ Base URL:', API_BASE_URL);
      console.error('   ├─ Full URL:', error.config?.baseURL + error.config?.url);
      console.error('   ├─ Timeout:', error.config?.timeout + 'ms');
      console.error('   └─ Error Code:', error.code);
      console.error('');
      console.error('   ⚠️  POSSIBLE CAUSES:');
      console.error('   1. Backend server is not running');
      console.error('   2. CORS not enabled on backend');
      console.error('   3. Firewall blocking connection');
      console.error('   4. Wrong backend URL/port');
      console.error('   5. Network connectivity issue');
      console.error('');
      console.error('   💡 SOLUTION:');
      console.error('   • Verify backend is running: http://localhost:3000');
      console.error('   • Add CORS to backend (see TROUBLESHOOTING.md)');
      console.error('   • Check browser console for more details');
    }
    // Server responded with error status
    else {
      console.error('   Error Type: SERVER ERROR');
      console.error('   Status:', error.response.status, error.response.statusText);
      console.error('   Response Data:', error.response.data);
      console.error('   Headers:', error.response.headers);

      if (error.response.status === 401) {
        console.error('   🔒 UNAUTHORIZED - Clearing auth and redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      if (error.response.status === 404) {
        console.error('   ⚠️  Endpoint not found - Check API documentation');
      }

      if (error.response.status === 500) {
        console.error('   ⚠️  Server error - Check backend logs');
      }
    }

    console.log('---');

    return Promise.reject(error);
  }
);
