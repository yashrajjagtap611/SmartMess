# 🔍 Troubleshooting: VITE_API_BASE_URL Not Working

## If you already added the variable but it's still not working:

### Step 1: Check the Browser Console

After deploying, open your app and check the browser console. You should see a group like this:

```
🌐 API Configuration (Production)
  Environment Variable Value: https://smartmessserver.onrender.com/api
  Raw API URL: https://smartmessserver.onrender.com/api
  Normalized API URL: https://smartmessserver.onrender.com/api
  ✅ API Base URL configured correctly: https://smartmessserver.onrender.com/api
  ✅ API calls will go to: https://smartmessserver.onrender.com/api
```

**If you see this instead:**
```
🌐 API Configuration (Production)
  Environment Variable Value: (NOT SET - using default /api)
  ❌ PROBLEM DETECTED: VITE_API_BASE_URL is not set correctly!
```

Then the variable is **NOT being read** by the build. Common causes:

### Step 2: Verify in Vercel Dashboard

1. **Go to**: https://vercel.com/dashboard
2. **Select**: Your project
3. **Go to**: Settings → Environment Variables
4. **Check**:
   - ✅ Variable name is exactly: `VITE_API_BASE_URL` (case-sensitive, no spaces)
   - ✅ Value is exactly: `https://smartmessserver.onrender.com/api`
   - ✅ Environment is set to **ALL** (Production ✅ Preview ✅ Development ✅)

### Step 3: Common Mistakes

#### ❌ Mistake 1: Variable name typo
- Wrong: `VITE_API_BASE_URL ` (trailing space)
- Wrong: `vite_api_base_url` (lowercase)
- Wrong: `VITE_API_URL` (wrong name)
- ✅ Correct: `VITE_API_BASE_URL`

#### ❌ Mistake 2: Wrong value
- Wrong: `https://smartmessserver.onrender.com` (missing `/api`)
- Wrong: `smartmessserver.onrender.com/api` (missing `https://`)
- Wrong: `https://smartmessserver.onrender.com/api/` (trailing slash - OK but not ideal)
- ✅ Correct: `https://smartmessserver.onrender.com/api`

#### ❌ Mistake 3: Wrong environment
- Wrong: Only selected "Production"
- ✅ Correct: Select **ALL** (Production, Preview, Development)

#### ❌ Mistake 4: Didn't redeploy
- **CRITICAL**: After adding/changing environment variables, you **MUST** redeploy
- Go to: Deployments → Click ⋯ on latest deployment → Redeploy

### Step 4: Verify the Build

1. **Check deployment logs**:
   - Go to: Deployments → Click on the latest deployment
   - Check the build logs
   - Look for: `VITE_API_BASE_URL` in the build output

2. **Check if variable is in the build**:
   - The variable should be visible in Vercel's build logs
   - If it's not there, it wasn't included in the build

### Step 5: Clear Cache and Redeploy

Sometimes Vercel caches the build:

1. **Delete the variable** (if it exists)
2. **Save**
3. **Redeploy**
4. **Add the variable again** with correct value
5. **Save**
6. **Redeploy again**

### Step 6: Check Vercel Project Settings

1. Go to: Settings → General
2. Check: **Build Command** and **Output Directory**
3. Make sure they're correct for your project

### Step 7: Manual Verification

After redeploying, check the browser console. The new code will show:

```
🌐 API Configuration (Production)
  Environment Variable Value: [YOUR VALUE HERE]
```

This will tell you exactly what value is being read.

## Still Not Working?

If after all these steps it's still not working:

1. **Check the exact error** in browser console
2. **Check Network tab** - see where API calls are actually going
3. **Verify backend URL** - make sure `https://smartmessserver.onrender.com` is accessible
4. **Check CORS** - make sure backend allows your Vercel domain

## Quick Test

After setting the variable and redeploying:

1. Open your app: `https://smart-mess-ten.vercel.app`
2. Open browser console (F12)
3. Look for the `🌐 API Configuration (Production)` group
4. Check what it says

If it says `(NOT SET - using default /api)`, then:
- The variable is not set correctly in Vercel, OR
- The build didn't include the variable, OR
- You didn't redeploy after adding the variable

## Expected Console Output (After Fix)

```
🌐 API Configuration (Production)
  Environment Variable Value: https://smartmessserver.onrender.com/api
  Raw API URL: https://smartmessserver.onrender.com/api
  Normalized API URL: https://smartmessserver.onrender.com/api
  ✅ API Base URL configured correctly: https://smartmessserver.onrender.com/api
  ✅ API calls will go to: https://smartmessserver.onrender.com/api
```

