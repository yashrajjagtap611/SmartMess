# QR Code Verification Feature

## Overview

The QR Code Verification feature allows mess owners to generate a permanent QR code for their mess that can be displayed at the entrance. Members can scan this QR code to verify their active membership status, enabling quick and secure entry verification.

## Features

### For Mess Owners

1. **Generate Mess QR Code**
   - Access from Settings → QR Verification
   - Generate a permanent QR code for the mess
   - QR code never expires
   - Can be printed and displayed at mess entrance

2. **QR Code Management**
   - Download QR code as image
   - Print QR code directly with formatted layout
   - View member statistics (active, total, expiring soon)

3. **Offline Verification**
   - QR code works even without internet
   - Mess staff can verify members at entrance

### For Users/Members

1. **Scan QR Code**
   - Scan mess QR code at entrance
   - Instant membership verification
   - View active meal plans
   - See membership validity dates

## Technical Implementation

### Backend Components

#### Files Created:
- `backend/src/services/messQRService.ts` - Core QR service
- `backend/src/routes/messQRVerification.ts` - API endpoints

#### Key Endpoints:

```
POST /api/mess-qr/generate
- Generate QR code for mess (Mess Owner only)
- Body: { messId: string }
- Returns: { qrCode: string, qrCodeData: string, expiresAt: null }

POST /api/mess-qr/verify-membership
- User verifies membership by scanning mess QR
- Body: { qrCodeData: string }
- Returns: { success: boolean, message: string, member: MemberInfo }

POST /api/mess-qr/verify-user
- Mess owner manually verifies a user
- Body: { messId: string, targetUserId: string }
- Returns: { success: boolean, message: string, member: MemberInfo }

GET /api/mess-qr/stats
- Get verification statistics
- Query: messId
- Returns: { totalMembers, activeMembers, expiringSoon, recentVerifications }

GET /api/mess-qr/my-mess
- Get mess owner's mess profile
- Returns: MessInfo
```

### Frontend Components

#### Files Created:
- `src/features/mess-owner/components/QRVerification/QRVerificationScreen.tsx`
- `src/features/user/components/MessVerificationScanner/MessVerificationScanner.tsx`
- `src/services/api/messQRService.ts`

#### Routes Added:
- `/mess-owner/settings/qr-verification` - Mess owner QR generation page

### QR Code Data Structure

```typescript
interface MessQRCodeData {
  messId: string;
  messName: string;
  verificationType: 'membership_check';
  timestamp: number;
  signature: string; // HMAC signature for security
}
```

### Security Features

1. **HMAC Signature**: Each QR code includes a cryptographic signature
2. **Timestamp Validation**: QR codes include creation timestamp
3. **Authorization**: Only mess owners can generate QR codes
4. **Membership Verification**: Checks active subscription status

## Usage Guide

### For Mess Owners

1. Navigate to **Settings** from the dashboard
2. Click on **QR Verification** tile
3. Click **Generate QR Code** button
4. Download or print the QR code
5. Display it at your mess entrance

### For Members

1. Go to the mess entrance
2. Find the displayed QR code
3. Open SmartMess app
4. Navigate to mess verification scanner
5. Scan the QR code
6. View your membership verification result

## Benefits

### Operational Benefits
- **Fast Entry**: Quick member verification at entrance
- **Offline Capable**: Works without internet connection
- **Reduced Manual Checks**: Automated membership verification
- **Fraud Prevention**: Cryptographic signatures prevent fake QR codes

### Member Benefits
- **Instant Verification**: No waiting for manual checks
- **Transparent**: See all active plans and validity dates
- **Convenient**: One scan shows complete membership status

## Database Models Used

- **MessProfile**: Mess information
- **MessMembership**: User subscriptions
- **User**: Member details

## Future Enhancements

1. **Camera Integration**: Direct QR scanning using device camera
2. **Verification Logs**: Track entry/exit with timestamps
3. **Attendance Analytics**: Member visit frequency tracking
4. **Multiple QR Codes**: Different QR codes for different areas
5. **Time-based Access**: Restrict access based on meal times
6. **Guest Pass QR**: Temporary QR codes for guests

## Configuration

### Environment Variables

```env
QR_SECRET_KEY=your-secret-key-for-hmac-signature
```

### Dependencies

Backend:
- `qrcode`: QR code generation library
- `crypto`: HMAC signature generation

Frontend:
- `@heroicons/react`: Icons
- `axios`: API requests

## Testing

### Test Scenarios

1. **Mess Owner Flow**
   - Login as mess owner
   - Navigate to QR Verification
   - Generate QR code
   - Download/Print QR code

2. **Member Verification**
   - Login as member
   - Scan mess QR code
   - Verify active membership displayed
   - Check plan details accuracy

3. **Security Testing**
   - Attempt to use modified QR data
   - Verify signature validation
   - Test with expired memberships
   - Test with inactive users

## API Response Examples

### Successful Verification
```json
{
  "success": true,
  "message": "Welcome John Doe! You have 2 active plan(s).",
  "data": {
    "userId": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "memberSince": "2024-01-15",
    "activePlans": [
      {
        "planName": "Full Meal Plan",
        "startDate": "2024-01-15",
        "endDate": "2024-12-31",
        "status": "active"
      }
    ]
  }
}
```

### Failed Verification
```json
{
  "success": false,
  "message": "You do not have an active membership at Elite Mess"
}
```

## Troubleshooting

### Common Issues

1. **QR Code Not Generating**
   - Ensure mess profile exists
   - Check network connection
   - Verify user has mess owner role

2. **Verification Failing**
   - Check if membership is active
   - Verify QR code is not corrupted
   - Ensure correct mess QR is being scanned

3. **Statistics Not Loading**
   - Verify mess owner has permission
   - Check if messId is valid
   - Review backend logs for errors

## Support

For issues or questions:
- Check backend logs at `backend/logs/`
- Review API responses in browser DevTools
- Contact system administrator

---

**Last Updated**: January 2024
**Version**: 1.0.0
