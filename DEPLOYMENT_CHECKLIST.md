# 🚀 Deployment Checklist - Fix All API Issues

## ✅ Code Fixes Completed

All code fixes are done and ready to deploy:

### Frontend Fixes:
1. ✅ `App.tsx` - `ConditionalMessProfileProvider` only renders for mess-owners
2. ✅ `MessProfileContext.tsx` - Checks user role before loading mess profile
3. ✅ `Profile.tsx` - Uses API client instead of raw fetch
4. ✅ `Profile.hooks.ts` (mess-owner) - Uses API client instead of raw fetch
5. ✅ `LeaveManagementAPI` - Uses API client instead of raw fetch
6. ✅ `api.ts` - Enhanced debugging to show API configuration

### Backend Fixes:
7. ✅ `backend/src/routes/mess/messProfile.ts` - Role check for mess-owners only

## ⚠️ CRITICAL: Environment Variable Setup

### Vercel Environment Variable (REQUIRED)

**You MUST set this before deploying:**

1. Go to: https://vercel.com/dashboard
2. Select: Your SmartMess project
3. Go to: **Settings → Environment Variables**
4. Add/Edit:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://smartmessserver.onrender.com/api`
   - **Environment**: ✅ Production ✅ Preview ✅ Development (ALL)
5. Click: **Save**

### Verify It's Set:
- Variable name is exactly: `VITE_API_BASE_URL` (case-sensitive)
- Value is exactly: `https://smartmessserver.onrender.com/api` (no trailing slash)
- All environments are selected

## 📦 Deployment Steps

### Step 1: Commit All Changes
```bash
git add .
git commit -m "Fix: Use API client for all API calls + Role-based mess profile loading"
git push origin main
```

### Step 2: Frontend Deployment (Vercel)
- Should auto-deploy when you push
- OR manually: Vercel Dashboard → Deployments → Redeploy latest

### Step 3: Backend Deployment (Render)
- Should auto-deploy if connected to GitHub
- OR manually: Render Dashboard → Your Service → Manual Deploy

### Step 4: Verify Deployment
After deployment completes:

1. **Check Frontend Console**:
   - Open: `https://smart-mess-ten.vercel.app`
   - Open browser console (F12)
   - Look for: `🌐 API Configuration (Production)`
   - Should show: `✅ API Base URL configured correctly: https://smartmessserver.onrender.com/api`

2. **Check Network Tab**:
   - API calls should go to: `https://smartmessserver.onrender.com/api/...`
   - NOT to: `https://smart-mess-ten.vercel.app/api/...`

3. **Test as Regular User**:
   - Login as regular user
   - Go to profile page
   - Check console: Should NOT see "Loading mess profile from backend..."
   - Check Network: Should NOT see calls to `/api/mess/profile`

4. **Test as Mess-Owner**:
   - Login as mess-owner
   - Everything should work correctly
   - Leave requests should load

## 🔍 Troubleshooting

### If API calls still go to Vercel:
1. ✅ Check `VITE_API_BASE_URL` is set in Vercel
2. ✅ Verify value is exactly: `https://smartmessserver.onrender.com/api`
3. ✅ Make sure you **redeployed** after setting the variable
4. ✅ Clear browser cache (Ctrl+Shift+R)

### If MessProfileContext still loads for regular users:
1. ✅ Check the deployed build includes the latest code
2. ✅ Check browser console for role check logs
3. ✅ Verify `App.tsx` changes are deployed

### If Leave Requests still 404:
1. ✅ Check backend is deployed with latest code
2. ✅ Verify route is mounted: `/api/mess/leave-requests`
3. ✅ Check backend logs for route registration

## 📝 Expected Behavior After Deployment

### Regular Users:
- ✅ MessProfileContext does NOT initialize
- ✅ No calls to `/api/mess/profile`
- ✅ No calls to `/api/mess/photo`
- ✅ User profile loads correctly

### Mess-Owners:
- ✅ MessProfileContext initializes
- ✅ Mess profile loads correctly
- ✅ Leave requests work
- ✅ All API calls go to Render backend

## 🎯 Success Indicators

After successful deployment, you should see in console:

```
🌐 API Configuration (Production)
  Environment Variable Value: https://smartmessserver.onrender.com/api
  ✅ API Base URL configured correctly: https://smartmessserver.onrender.com/api
  ✅ API calls will go to: https://smartmessserver.onrender.com/api
```

And in Network tab:
- All API calls go to: `https://smartmessserver.onrender.com/api/...`
- No 404 errors (except for expected ones like missing mess profile for new users)

