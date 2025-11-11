# ⚠️ CRITICAL: Vercel Environment Variable Setup

## 🚨 Problem

If you see API calls going to `https://smart-mess-ten.vercel.app/api/...` instead of `https://smartmessserver.onrender.com/api/...`, it means `VITE_API_BASE_URL` is **NOT SET** in Vercel.

## ✅ Solution: Set Environment Variable in Vercel

### Step 1: Go to Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Select your project: **SmartMess** (or your project name)
3. Click on **Settings** (in the top navigation)
4. Click on **Environment Variables** (in the left sidebar)

### Step 2: Add Environment Variable

1. Click **Add New** button
2. Fill in:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://smartmessserver.onrender.com/api`
   - **Environment**: Select **ALL** (Production, Preview, Development)
3. Click **Save**

### Step 3: Redeploy

**IMPORTANT**: After adding the environment variable, you **MUST** redeploy:

1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## ✅ Verification

After redeploying, check the browser console. You should see:

```
✅ API Base URL configured for production: https://smartmessserver.onrender.com/api
```

If you see this warning instead:
```
⚠️ VITE_API_BASE_URL is not set correctly in production!
```

Then the environment variable is still not set correctly. Double-check:
1. Variable name is exactly: `VITE_API_BASE_URL` (case-sensitive)
2. Variable value is exactly: `https://smartmessserver.onrender.com/api` (no trailing slash needed, but OK if present)
3. Environment is set to **ALL** (Production, Preview, Development)
4. You **redeployed** after adding the variable

## 📋 Complete Environment Variables List

For your Vercel project, you should have:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_API_BASE_URL` | `https://smartmessserver.onrender.com/api` | All |
| `VITE_APP_NAME` | `SmartMess` | All (optional) |
| `VITE_APP_VERSION` | `1.0.0` | All (optional) |
| `VITE_APP_DESCRIPTION` | `Mess Management System` | All (optional) |

## 🔍 Troubleshooting

### API calls still going to Vercel frontend

1. **Check if variable is set**: Go to Vercel → Settings → Environment Variables
2. **Check variable name**: Must be exactly `VITE_API_BASE_URL` (case-sensitive)
3. **Check variable value**: Must be `https://smartmessserver.onrender.com/api`
4. **Redeploy**: Environment variables only apply to **new deployments**
5. **Clear browser cache**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Still not working?

1. Check browser console for the API Base URL log message
2. Check Network tab to see where API calls are going
3. Verify the backend is running: `https://smartmessserver.onrender.com/api/health` (if you have a health endpoint)

## 📝 Notes

- Environment variables starting with `VITE_` are exposed to the browser
- They are **baked into the build** at build time
- You **must redeploy** after adding/changing environment variables
- The value should **NOT** have a trailing slash (but it will be normalized if present)

