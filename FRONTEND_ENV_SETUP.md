# Frontend Environment Variables Setup

## 📋 Required Environment Variables

### For Local Development

Create a `.env.local` file in the root directory:

```env
# API Configuration for Local Development
# Use /api for local dev (Vite proxy handles backend routing)
VITE_API_BASE_URL=/api

# Application Info (optional)
VITE_APP_NAME=SmartMess
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Mess Management System
```

### For Production (Vercel)

Set these environment variables in **Vercel Dashboard**:

1. Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Add the following variables:

```env
VITE_API_BASE_URL=https://smartmessserver.onrender.com/api
```

**Important Notes:**
- ✅ **Correct**: `https://smartmessserver.onrender.com/api` (no trailing slash)
- ✅ **Also works**: `https://smartmessserver.onrender.com/api/` (will be normalized)
- ✅ **Also works**: `https://smartmessserver.onrender.com/` (will have `/api` added automatically)
- ❌ **Wrong**: `https://smartmessserver.onrender.com` (missing `/api`)

3. **Apply to**: Production, Preview, and Development
4. **Redeploy** after adding environment variables

## 🔧 Environment Variable Details

### `VITE_API_BASE_URL` (Required)

**Purpose**: Backend API base URL

**Local Development:**
```env
VITE_API_BASE_URL=/api
```
- Uses Vite proxy (configured in `vite.config.ts`)
- Proxy forwards `/api/*` requests to `http://localhost:5000`

**Production:**
```env
VITE_API_BASE_URL=https://smartmessserver.onrender.com/api
```
- Direct connection to Render backend
- Must include `/api` at the end
- No trailing slash needed (but will be normalized if present)

### `VITE_APP_NAME` (Optional)

**Default**: `SmartMess`

```env
VITE_APP_NAME=SmartMess
```

### `VITE_APP_VERSION` (Optional)

**Default**: `1.0.0`

```env
VITE_APP_VERSION=1.0.0
```

### `VITE_APP_DESCRIPTION` (Optional)

**Default**: `Mess Management System`

```env
VITE_APP_DESCRIPTION=Mess Management System
```

## 📝 Complete Example Files

### `.env.local` (Local Development)

```env
# ===========================================
# SmartMess Frontend - Local Development
# ===========================================
# This file is gitignored and won't be committed

# API Configuration for Local Development
# Use /api for local dev (Vite proxy handles backend routing)
VITE_API_BASE_URL=/api

# Application Info (optional)
VITE_APP_NAME=SmartMess
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION=Mess Management System
```

### Vercel Environment Variables (Production)

**Variable Name**: `VITE_API_BASE_URL`  
**Value**: `https://smartmessserver.onrender.com/api`  
**Environment**: Production, Preview, Development

## 🚀 Quick Setup Guide

### Local Development

1. Create `.env.local` file in project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and set:
   ```env
   VITE_API_BASE_URL=/api
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

### Vercel Deployment

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. Click **Add New**
5. Add:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://smartmessserver.onrender.com/api`
   - **Environment**: Select all (Production, Preview, Development)
6. Click **Save**
7. **Redeploy** your application

## ✅ Verification

After setting up environment variables:

1. **Check browser console** (in development):
   - Look for: `API Base URL configured: { raw: '...', normalized: '...' }`

2. **Check Network tab**:
   - API requests should go to correct URL
   - No double slashes (`//`) in URLs
   - CORS should work (no CORS errors)

3. **Test login**:
   - Should successfully connect to backend
   - No 404 or CORS errors

## 🔍 Troubleshooting

### Double Slash in URL (`//api`)

**Problem**: URL shows `https://smartmessserver.onrender.com//api/auth/login`

**Solution**: 
- Check `VITE_API_BASE_URL` in Vercel
- Should be: `https://smartmessserver.onrender.com/api` (no trailing slash)
- The code will normalize it, but best to set it correctly

### CORS Error

**Problem**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
1. Verify backend CORS includes your Vercel URL
2. Check `backend/src/server.ts` has: `'https://smart-mess-ten.vercel.app'`
3. Redeploy backend on Render

### 404 Error on API Calls

**Problem**: `POST /api/auth/login 404`

**Solution**:
1. Verify `VITE_API_BASE_URL` is set correctly
2. For production: Must include `/api` at the end
3. Check backend is running and accessible

## 📚 Additional Resources

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

