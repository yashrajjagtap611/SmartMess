# 🚨 QUICK FIX: API Calls Going to Wrong URL

## Problem
API calls are going to `https://smart-mess-ten.vercel.app/api/...` instead of `https://smartmessserver.onrender.com/api/...`

## Solution (5 minutes)

### Step 1: Set Environment Variable in Vercel

1. **Go to**: https://vercel.com/dashboard
2. **Select**: Your SmartMess project
3. **Click**: Settings → Environment Variables
4. **Click**: Add New
5. **Enter**:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://smartmessserver.onrender.com/api`
   - **Environment**: ✅ Production ✅ Preview ✅ Development (select ALL)
6. **Click**: Save

### Step 2: Redeploy (CRITICAL!)

**You MUST redeploy after adding the environment variable:**

1. **Go to**: Deployments tab
2. **Click**: ⋯ (three dots) on the latest deployment
3. **Click**: Redeploy
4. **Wait**: For deployment to complete (~2-3 minutes)

### Step 3: Verify

After redeploying, open your app and check the browser console. You should see:

```
✅ API Base URL configured for production: https://smartmessserver.onrender.com/api
```

If you see this instead:
```
⚠️ VITE_API_BASE_URL is not set correctly in production!
```

Then the variable wasn't set correctly. Double-check:
- Variable name is exactly: `VITE_API_BASE_URL` (case-sensitive, no spaces)
- Value is exactly: `https://smartmessserver.onrender.com/api`
- You selected ALL environments
- You clicked Redeploy after saving

## Why This Happens

Vite environment variables (starting with `VITE_`) are **baked into the build** at build time. If the variable isn't set when Vercel builds your app, it defaults to `/api` (relative URL), which points to the Vercel frontend instead of your Render backend.

## After Fixing

Once the environment variable is set and you've redeployed:
- ✅ API calls will go to `https://smartmessserver.onrender.com/api`
- ✅ Profile will load correctly
- ✅ All API endpoints will work
- ✅ No more 404 errors

---

**Need more help?** See `VERCEL_ENV_SETUP.md` for detailed instructions.

