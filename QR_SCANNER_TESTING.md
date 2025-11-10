# QR Scanner Testing Guide

## ✅ What Was Fixed

1. **Installed jsQR library** - QR detection now works!
2. **Implemented actual QR detection** - No more placeholder
3. **Added comprehensive logging** - Easy debugging
4. **Added visual feedback** - Shows scan count and status

## 🧪 How to Test

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Navigate to Scanner
1. Login as a **user** (not mess owner)
2. Click "Verify Membership" in navigation
3. Click blue "Open Camera to Scan" button

### Step 3: Check Browser Console
Open browser console (F12) and look for these logs:
```
📷 Starting camera...
✅ Camera access granted
📹 Video ready, starting QR detection...
Video dimensions: 1280x720
🔍 Starting QR scan loop (every 500ms)...
🔍 Scanned 10 times...
🔍 Scanned 20 times...
```

### Step 4: Test QR Detection
Point camera at a QR code. You should see:
```
✅ QR Code detected: {"messId":"...","messName":"..."}
✅ QR Code found! Verifying...
```

## 📊 Visual Feedback

### On Scanner Screen:
- ✅ **Green pulsing dot** = Scanning active
- ✅ **Scan counter** = Shows (0), (1), (2)... as it scans
- ✅ **Animated blue line** = Visual scanning indicator

## 🔍 Debugging Steps

### If Camera Doesn't Open:
1. Check console for errors
2. Grant camera permission when prompted
3. Try in Chrome/Edge (best support)
4. Ensure you're on HTTPS or localhost

### If QR Not Detecting:
1. Watch scan counter - should increment every 0.5s
2. Check console for "Scanned X times..." logs
3. Try these:
   - Better lighting
   - Hold camera steady
   - Move closer to QR code
   - Ensure QR code is clear and not damaged

### If Scan Count Not Increasing:
- Video might not be ready
- Check console for "Video ready" message
- Try refreshing the page

## 🎯 Expected Console Output

### Successful Flow:
```
📷 Starting camera...
✅ Camera access granted
📹 Video ready, starting QR detection...
Video dimensions: 1280x720
🔍 Starting QR scan loop (every 500ms)...
🔍 Scanned 10 times...
🔍 Scanned 20 times...
✅ QR Code detected: {"messId":"68ff736535020d89ab4c701d","messName":"Yashraj mess",...}
✅ QR Code found! Verifying...
📷 Camera stopped
```

### If No QR Found (Normal):
```
📷 Starting camera...
✅ Camera access granted
📹 Video ready, starting QR detection...
🔍 Starting QR scan loop (every 500ms)...
🔍 Scanned 10 times...
🔍 Scanned 20 times...
🔍 Scanned 30 times...
(Continues until QR is found)
```

### Camera Error:
```
📷 Starting camera...
❌ Camera access error: NotAllowedError: Permission denied
```

## 🧪 Manual Testing Options

### Test Without Physical QR Code:
1. Click "Enter Code Manually" button
2. Paste this test data:
```json
{"messId":"68ff736535020d89ab4c701d","messName":"Yashraj mess","verificationType":"membership_check","timestamp":1706789123456,"signature":"test"}
```
3. Should show verification result

### Generate Test QR Code:
1. Go to mess owner QR Verification page
2. Generate QR code
3. Screenshot it
4. Display on another screen
5. Point camera at it

## ✅ Success Indicators

### Scanner Working:
- ✅ Camera feed visible
- ✅ Scan counter incrementing
- ✅ Green pulsing dot visible
- ✅ Console shows "Scanned X times..."

### QR Detection Working:
- ✅ Console shows "QR Code detected"
- ✅ Scanner closes automatically
- ✅ "Verifying membership..." appears
- ✅ Results displayed

## 📱 Mobile Testing

### iOS Safari:
- Works on iOS 11+
- May need to tap video to start
- Back camera used automatically

### Chrome Mobile:
- Full support
- Smooth detection
- Good performance

## 🐛 Common Issues

### Issue: "Position QR code within the frame" but nothing happens
**Solution**: Check console logs. If scan count is increasing, detection is working but QR might be:
- Too small
- Too blurry
- Not a valid QR code
- Wrong format

### Issue: Scan count stuck at 0
**Solution**: 
1. Video not ready yet - wait 2-3 seconds
2. Check if video is actually playing
3. Try refreshing the page

### Issue: Camera permission denied
**Solution**:
1. Browser settings → Site settings
2. Enable camera for localhost/your domain
3. Refresh page and try again

### Issue: QR detected but verification fails
**Solution**:
1. Check if you have active membership
2. Verify QR is from correct mess
3. Check backend logs
4. Ensure auth token is valid

## 🎬 Quick Test Script

Run these commands in browser console:

```javascript
// Check if jsQR is loaded
console.log('jsQR loaded:', typeof jsQR !== 'undefined');

// Check video stream
const video = document.querySelector('video');
console.log('Video ready:', video?.readyState === 4);
console.log('Video dimensions:', video?.videoWidth, 'x', video?.videoHeight);

// Check if scanning
console.log('Scanner active:', video?.srcObject !== null);
```

## 📈 Performance Metrics

### Expected:
- **Camera start**: < 1 second
- **Scan interval**: 500ms (2 scans/second)
- **QR detection**: < 100ms per scan
- **Verification API**: < 2 seconds

### Monitor:
```javascript
// In console, watch scan count increase
// Should increment by 2 every second
```

## ✅ Final Checklist

Before reporting issues, verify:
- [ ] jsQR installed (`npm install jsqr` done)
- [ ] Browser console open (F12)
- [ ] Camera permission granted
- [ ] Video feed visible
- [ ] Scan counter incrementing
- [ ] Console shows scan logs
- [ ] QR code is clear and visible
- [ ] Good lighting conditions

## 🎯 What Should Happen

1. **Click "Open Camera to Scan"**
   - Modal opens
   - Camera permission requested
   - Camera feed shows

2. **Point at QR Code**
   - Scan counter increases
   - Every 0.5 seconds
   - Console logs scan attempts

3. **QR Detected**
   - Console: "QR Code detected"
   - Scanner closes
   - Shows "Verifying..."

4. **Verification Complete**
   - Success: Shows member details
   - Failure: Shows error message

## 🆘 Need Help?

If still not working:
1. Share browser console logs
2. Share which step fails
3. Share error messages
4. Try manual input as workaround

---

**Last Updated**: January 2024
**Status**: ✅ Scanner Active with jsQR Detection
