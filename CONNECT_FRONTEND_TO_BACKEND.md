# 🔌 How to Connect Frontend to Backend

## 📋 Overview

The frontend connects to the backend in two ways:
1. **Local Development**: Uses Vite proxy (automatic routing)
2. **Production**: Direct connection to Render backend (via environment variable)

---

## 🏠 Local Development Setup

### Step 1: Start Backend Server

```bash
cd backend
npm install
npm run dev
```

Backend will run on: `http://localhost:5000`

### Step 2: Configure Frontend Environment

Create `.env.local` in the **root directory** (same level as `package.json`):

```env
VITE_API_BASE_URL=/api
```

### Step 3: Start Frontend

```bash
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

### How It Works Locally

1. Frontend makes request to: `/api/auth/login`
2. Vite proxy (configured in `vite.config.ts`) intercepts `/api/*` requests
3. Proxy forwards to: `http://localhost:5000/api/auth/login`
4. Backend processes the request

**No additional configuration needed!** The proxy handles everything.

---

## 🌐 Production Setup (Vercel + Render)

### Step 1: Configure Backend CORS (Render)

The backend needs to allow requests from your Vercel frontend.

**In Render Dashboard:**
1. Go to your backend service → **Environment** tab
2. Add/Update environment variable:
   ```
   FRONTEND_URL=https://smart-mess-ten.vercel.app
   ```
3. **Redeploy** the backend

**Or in `backend/.env` file:**
```env
FRONTEND_URL=https://smart-mess-ten.vercel.app
```

The backend CORS configuration in `backend/src/server.ts` already includes:
- `https://smart-mess-ten.vercel.app` ✅
- Your `FRONTEND_URL` from environment ✅

### Step 2: Configure Frontend API URL (Vercel)

**In Vercel Dashboard:**
1. Go to your project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://smartmessserver.onrender.com/api`
   - **Environment**: Select all (Production, Preview, Development)
4. Click **Save**
5. **Redeploy** your frontend

### Step 3: Verify Connection

After deployment:
1. Open your Vercel app: `https://smart-mess-ten.vercel.app`
2. Open browser DevTools → **Console**
3. Try to login
4. Check **Network** tab:
   - Should see requests to: `https://smartmessserver.onrender.com/api/auth/login`
   - Should get successful response (200 OK)
   - No CORS errors

---

## 🔧 Configuration Details

### Frontend Configuration

**File**: `src/services/api.ts`

The frontend automatically:
- Detects if `VITE_API_BASE_URL` is a full URL (starts with `http`)
- Normalizes the URL (removes trailing slashes, adds `/api` if needed)
- Uses relative URL `/api` for local development (Vite proxy)

**Local Development:**
```env
VITE_API_BASE_URL=/api
```
→ Uses Vite proxy → `http://localhost:5000`

**Production:**
```env
VITE_API_BASE_URL=https://smartmessserver.onrender.com/api
```
→ Direct connection to Render backend

### Backend Configuration

**File**: `backend/src/server.ts`

CORS is configured to allow:
- Local development URLs (`http://localhost:5173`, etc.)
- Your Vercel frontend URL (`https://smart-mess-ten.vercel.app`)
- The `FRONTEND_URL` from environment variables

**Required Backend Environment Variables:**
```env
FRONTEND_URL=https://smart-mess-ten.vercel.app
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
# ... other required variables
```

---

## ✅ Quick Setup Checklist

### Local Development
- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend has `.env.local` with `VITE_API_BASE_URL=/api`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Test login - should work ✅

### Production
- [ ] Backend deployed on Render
- [ ] Backend has `FRONTEND_URL=https://smart-mess-ten.vercel.app` in environment
- [ ] Frontend deployed on Vercel
- [ ] Vercel has `VITE_API_BASE_URL=https://smartmessserver.onrender.com/api` in environment
- [ ] Both services redeployed
- [ ] Test login on production - should work ✅

---

## 🐛 Troubleshooting

### Issue: CORS Error

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Check backend CORS includes your frontend URL
2. Verify `FRONTEND_URL` in Render backend environment
3. Redeploy backend

### Issue: 404 Error

**Error**: `POST /api/auth/login 404`

**Solution**:
1. Check `VITE_API_BASE_URL` is set correctly in Vercel
2. Verify backend is running and accessible
3. Check backend routes are mounted correctly

### Issue: Double Slash in URL

**Error**: `https://smartmessserver.onrender.com//api/auth/login`

**Solution**:
1. Set `VITE_API_BASE_URL=https://smartmessserver.onrender.com/api` (no trailing slash)
2. The code will normalize it, but set it correctly
3. Redeploy frontend

### Issue: Connection Refused

**Error**: `net::ERR_FAILED` or connection timeout

**Solution**:
1. Verify backend is running (check Render dashboard)
2. Check backend URL is correct
3. Verify network/firewall allows the connection

---

## 📝 Environment Variables Summary

### Frontend (Vercel)

```env
VITE_API_BASE_URL=https://smartmessserver.onrender.com/api
```

### Backend (Render)

```env
FRONTEND_URL=https://smart-mess-ten.vercel.app
PORT=5000
NODE_ENV=production
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email
EMAIL_PASS=your-password
EMAIL_FROM=your-email
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🚀 Testing the Connection

### Test 1: Health Check

**Frontend Code:**
```typescript
// Test API connection
fetch('/api/health')
  .then(res => res.json())
  .then(data => console.log('Backend connected:', data))
  .catch(err => console.error('Connection failed:', err));
```

**Expected Response:**
```json
{
  "success": true,
  "message": "SmartMess API is running",
  "timestamp": "2025-11-10T19:30:00.000Z",
  "version": "1.0.0"
}
```

### Test 2: Login

Try logging in through the UI:
- Should successfully connect to backend
- Should receive JWT token
- Should redirect to dashboard

---

## 📚 Additional Resources

- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)
- [Axios Configuration](https://axios-http.com/docs/config_defaults)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 🎯 Summary

**Local Development:**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`
- Frontend `.env.local`: `VITE_API_BASE_URL=/api`
- Uses Vite proxy automatically ✅

**Production:**
- Backend: `https://smartmessserver.onrender.com`
- Frontend: `https://smart-mess-ten.vercel.app`
- Vercel env: `VITE_API_BASE_URL=https://smartmessserver.onrender.com/api`
- Render env: `FRONTEND_URL=https://smart-mess-ten.vercel.app`
- Direct connection ✅

