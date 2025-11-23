# Authentication Integration Guide

## Current Setup (Mock Authentication)

Currently, the frontend uses **mock authentication** that works without a backend. When you login:

1. Any email/password is accepted
2. A fake token is generated: `mock-token-1732364123456`
3. User defaults to **Free Plan**
4. Token is stored in localStorage
5. Token is automatically attached to all API requests

## Integrating with Your Backend

To connect to your real backend authentication API, follow these steps:

### Step 1: Create Backend Auth Endpoints

Your backend should have these endpoints:

```typescript
// 1. Register/Signup
POST /api/auth/register
Body: { email, password, name? }
Response: {
  success: true,
  data: {
    user: { id, email, name, plan },
    token: "jwt-token-here"
  }
}

// 2. Login
POST /api/auth/login
Body: { email, password }
Response: {
  success: true,
  data: {
    user: { id, email, name, plan },
    token: "jwt-token-here"
  }
}

// 3. Get Current User (optional)
GET /api/auth/me
Headers: { Authorization: "Bearer jwt-token" }
Response: {
  success: true,
  data: {
    user: { id, email, name, plan }
  }
}
```

### Step 2: Create Auth API Service

Create `src/api/auth.ts`:

```typescript
import { apiClient } from './client';
import { User } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

export async function loginAPI(email: string, password: string): Promise<LoginResponse> {
  console.log('\n🔑 API Login Request:');
  console.log('   Email:', email);

  const response = await apiClient.post('/auth/login', {
    email,
    password,
  });

  console.log('   ✅ Login API successful!');
  console.log('   User:', response.data.data.user);
  console.log('   Token received');
  console.log('---');

  return response.data.data;
}

export async function registerAPI(
  email: string,
  password: string,
  name?: string
): Promise<LoginResponse> {
  console.log('\n📝 API Register Request:');
  console.log('   Email:', email);
  console.log('   Name:', name);

  const response = await apiClient.post('/auth/register', {
    email,
    password,
    name,
  });

  console.log('   ✅ Registration API successful!');
  console.log('   User:', response.data.data.user);
  console.log('   Token received');
  console.log('---');

  return response.data.data;
}

export async function getCurrentUserAPI(): Promise<User> {
  const response = await apiClient.get('/auth/me');
  return response.data.data.user;
}
```

### Step 3: Update AuthContext to Use Real API

Update `src/context/AuthContext.tsx`:

```typescript
import { loginAPI, registerAPI, getCurrentUserAPI } from '../api/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 Auth Provider Initializing...');

    // Try to load user from backend using stored token
    const token = localStorage.getItem('authToken');

    if (token) {
      console.log('   ✅ Found auth token, verifying with backend...');

      getCurrentUserAPI()
        .then((user) => {
          console.log('   ✅ Token valid, user loaded:', user);
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        })
        .catch((error) => {
          console.log('   ❌ Token invalid or expired, clearing...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      console.log('   ℹ️  No stored token - user needs to login');
      setLoading(false);
    }
    console.log('---');
  }, []);

  const login = async (email: string, password: string) => {
    console.log('\n🔑 Login Attempt:');
    console.log('   Email:', email);

    try {
      // Call your real backend API
      const { user, token } = await loginAPI(email, password);

      console.log('   ✅ Login successful!');
      console.log('   User:', user);
      console.log('   Token received from backend');

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authToken', token);

      console.log('   💾 Saved to localStorage');
      console.log('---');
    } catch (error: any) {
      console.error('   ❌ Login failed:', error.message);
      console.log('---');
      throw error; // Re-throw so Login component can handle it
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    console.log('\n📝 Register Attempt:');
    console.log('   Email:', email);

    try {
      const { user, token } = await registerAPI(email, password, name);

      console.log('   ✅ Registration successful!');
      console.log('   User:', user);

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('authToken', token);

      console.log('   💾 Saved to localStorage');
      console.log('---');
    } catch (error: any) {
      console.error('   ❌ Registration failed:', error.message);
      console.log('---');
      throw error;
    }
  };

  const logout = () => {
    console.log('\n🚪 Logout:');
    console.log('   Removing user:', user?.email);

    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');

    console.log('   ✅ Logged out successfully');
    console.log('---');
  };

  // Show loading spinner while checking token
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register, // Add this!
        logout,
        updateUserPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

### Step 4: Update Types

Update `src/types/index.ts` to add register to AuthContext:

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  createdAt: string;
}

// Add to AuthContextType
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  updateUserPlan: (plan: PlanType) => void;
}
```

### Step 5: Update Login/Signup Pages

The login and signup pages will automatically work with the real API now, but you should add better error handling:

```typescript
// In Login.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    await login(email, password);
    navigate('/dashboard');
  } catch (error: any) {
    // Show user-friendly error
    if (error.response?.status === 401) {
      setError('Invalid email or password');
    } else {
      setError('Login failed. Please try again.');
    }
    console.error('Login error:', error);
  } finally {
    setLoading(false);
  }
};
```

## Testing the Integration

### 1. **Without Backend** (Current Mock)
```bash
cd frontend
npm run dev
# Visit http://localhost:3001
# Login with ANY email/password
```

### 2. **With Backend** (After Integration)
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Visit http://localhost:3001
# Login with REAL credentials from your backend
```

## Checking If Token Is Working

Open browser console (F12) and run:

```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('authToken'));

// Check user
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

You should see:
```
Token: "jwt-token-from-backend" or "mock-token-123456"
User: { id: '1', email: 'test@example.com', plan: 'Free', ... }
```

## Backend Authentication Example

Here's a simple example for your backend (`src/routes/auth.ts`):

```typescript
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in database (example)
    const user = await db.users.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user and token
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan || 'Free',
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await db.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.users.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      plan: 'Free', // Default plan
      createdAt: new Date(),
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.users.findById(req.userId);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          plan: user.plan,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
```

## Summary

**Current (Mock Auth):**
- ✅ Works without backend
- ✅ Token automatically attached
- ✅ Good for frontend development

**After Integration:**
- ✅ Real authentication with your backend
- ✅ JWT tokens from backend
- ✅ User plan comes from database
- ✅ Token still automatically attached

The Authorization header will work the **same way** in both cases - automatically attached to every request!
