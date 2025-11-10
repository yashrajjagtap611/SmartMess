# QR Scanner Setup Instructions

## Overview
The user-side QR scanner has been created with camera integration. To enable actual QR code detection, you need to install the jsQR library.

## Installation

### Step 1: Install jsQR Library

```bash
cd c:\Users\yashr\Downloads\SmartMess
npm install jsqr
```

Or with yarn:
```bash
yarn add jsqr
```

### Step 2: Update QRScannerModal.tsx

After installing jsQR, update the `detectQRCode` function in:
`src/features/user/components/MessVerificationScanner/QRScannerModal.tsx`

Replace the placeholder function:

```typescript
// BEFORE (placeholder):
const detectQRCode = (imageData: ImageData): string | null => {
  return null;
};
```

With the actual implementation:

```typescript
// AFTER (with jsQR):
import jsQR from 'jsqr';

const detectQRCode = (imageData: ImageData): string | null => {
  const code = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: "dontInvert",
  });
  return code ? code.data : null;
};
```

## Features Implemented

### ✅ Camera Access
- Requests camera permission from browser
- Uses back camera on mobile devices
- Shows error message if permission denied

### ✅ QR Scanner Modal
- Full-screen scanner interface
- Visual scanning frame with corner markers
- Animated scanning line
- Real-time QR detection (500ms interval)
- Manual input fallback option

### ✅ Verification Flow
1. User clicks "Open Camera to Scan"
2. Browser requests camera permission
3. Camera feed displayed with scanning overlay
4. QR code automatically detected
5. Verification API called
6. Results displayed (success/failure)
7. Can scan again if needed

### ✅ Error Handling
- Camera permission denied
- No camera available
- QR detection failures
- Network errors
- Invalid QR codes

## Component Structure

```
MessVerificationScanner/
├── MessVerificationScanner.tsx   # Main component
├── QRScannerModal.tsx            # Camera scanner modal
└── index.ts                       # Exports
```

## How It Works

### 1. Scanner Activation
```typescript
<button onClick={() => setShowScanner(true)}>
  Open Camera to Scan
</button>
```

### 2. Camera Access
```typescript
const mediaStream = await navigator.mediaDevices.getUserMedia({
  video: { facingMode: 'environment' }
});
```

### 3. QR Detection Loop
```typescript
setInterval(() => {
  scanQRCode(); // Capture frame, detect QR
}, 500);
```

### 4. Verification
```typescript
const result = await messQRService.scanMessQR(qrData);
// Display result with member details
```

## UI States

### Initial State
- Shows QR icon
- "Open Camera to Scan" button
- Instructions

### Scanning State  
- Camera feed full screen
- Scanning frame overlay
- Animated scan line
- "Manual Input" fallback button

### Verifying State
- Loading spinner
- "Verifying membership..." text

### Success State
- ✅ Green checkmark
- Member name and email
- Member since date
- List of active plans with dates
- "Scan Again" button

### Error State
- ❌ Red X icon
- Error message
- "Scan Again" button (if result exists)

## Browser Compatibility

### Camera API Support
- ✅ Chrome/Edge 53+
- ✅ Firefox 36+
- ✅ Safari 11+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### HTTPS Requirement
⚠️ **Important**: Camera access requires HTTPS in production!
- Works on `localhost` without HTTPS (development)
- Production must use HTTPS

## Testing

### Development Testing
1. Start frontend: `npm run dev`
2. Navigate to "Verify Membership"
3. Click "Open Camera to Scan"
4. Allow camera permission
5. Point at mess QR code (or use manual input for testing)

### Manual Input Testing
For testing without a physical QR code:
1. Click "Enter Code Manually"
2. Paste QR code data (JSON string from mess owner QR)
3. Verify results

## Permissions

### Browser Permissions Required
- **Camera**: Required for QR scanning
- **HTTPS**: Required in production (auto on localhost)

### How to Grant Permissions
1. Browser will prompt when clicking "Open Camera"
2. Click "Allow" in permission dialog
3. If blocked, user can enable in browser settings

## Mobile Optimization

### Features
- Uses back camera by default (`facingMode: 'environment'`)
- Responsive modal size
- Touch-friendly buttons
- Optimized for portrait mode

### iOS Specific
- Works in Safari iOS 11+
- Requires user interaction to start
- May need inline playback attributes

## Troubleshooting

### Camera Not Working
1. Check browser console for errors
2. Verify HTTPS (or localhost)
3. Check camera permissions in browser settings
4. Try different browser
5. Use "Manual Input" as fallback

### QR Not Detecting
1. Ensure good lighting
2. Hold camera steady
3. Position QR within frame
4. Try moving closer/farther
5. Check QR code quality

### Verification Fails
1. Check internet connection
2. Verify user has active membership
3. Ensure QR code is from correct mess
4. Check backend logs

## Production Checklist

- [ ] Install jsQR library
- [ ] Update detectQRCode function
- [ ] Deploy on HTTPS domain
- [ ] Test camera permissions
- [ ] Test on mobile devices
- [ ] Test QR detection accuracy
- [ ] Test with various QR code sizes
- [ ] Test in different lighting conditions
- [ ] Add error logging
- [ ] Monitor verification success rate

## Next Steps

### Immediate
1. Run: `npm install jsqr`
2. Update detectQRCode function (as shown above)
3. Test camera access

### Optional Enhancements
1. Add vibration feedback on successful scan
2. Add sound effect on detection
3. Implement torch/flashlight toggle
4. Add zoom controls
5. Save scan history
6. Add offline caching

## Code Examples

### Complete jsQR Integration

```typescript
// At top of QRScannerModal.tsx
import jsQR from 'jsqr';

// Replace detectQRCode function
const detectQRCode = (imageData: ImageData): string | null => {
  try {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    
    if (code) {
      console.log('QR Code detected:', code.data);
      return code.data;
    }
    
    return null;
  } catch (error) {
    console.error('QR detection error:', error);
    return null;
  }
};
```

### Test QR Data Format

The QR code should contain JSON like:
```json
{
  "messId": "68ff736535020d89ab4c701d",
  "messName": "Yashraj mess",
  "verificationType": "membership_check",
  "timestamp": 1706789123456,
  "signature": "abc123..."
}
```

## Support

For issues:
1. Check browser console for errors
2. Review backend logs
3. Test with manual input first
4. Verify API endpoints are working

---

**Status**: 🚧 Ready for Testing (jsQR installation needed)
**Last Updated**: January 2024
