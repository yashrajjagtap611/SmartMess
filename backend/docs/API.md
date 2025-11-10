# SmartMess API Documentation

## Overview

SmartMess is a comprehensive mess management system API that provides authentication, user management, mess profiles, meal plans, and more.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "code": "SUCCESS_CODE"
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123!",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "user_id",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "user",
      "isVerified": true
    }
  }
}
```

#### POST /auth/verify-otp
Verify email with OTP.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

#### POST /auth/resend-otp
Resend OTP to email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST /auth/forgot-password
Send password reset OTP.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

#### POST /auth/reset-password
Reset password with OTP.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

### User Management

#### GET /user/profile
Get current user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "role": "user",
    "avatar": "profile_picture_url",
    "status": "active",
    "address": "User address",
    "gender": "male",
    "dob": "1990-01-01T00:00:00.000Z",
    "isVerified": true,
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /user/profile
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "address": "New address",
  "gender": "male",
  "dob": "1990-01-01"
}
```

#### POST /user/avatar
Upload profile picture.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
avatar: <file>
```

#### GET /user/activity
Get user activity log.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `type` (optional): Activity type filter

### Mess Management

#### GET /mess/profile
Get mess profile for current user.

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /mess/profile
Update mess profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Mess Name",
  "description": "Mess description",
  "address": "Mess address",
  "phone": "1234567890",
  "email": "mess@example.com",
  "operatingHours": {
    "monday": {
      "isOpen": true,
      "openTime": "07:00",
      "closeTime": "22:00"
    }
  },
  "mealTypes": ["breakfast", "lunch", "dinner"],
  "pricing": {
    "breakfast": 50,
    "lunch": 100,
    "dinner": 100,
    "currency": "INR"
  },
  "capacity": 100
}
```

#### POST /mess/photo
Upload mess photo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
photo: <file>
```

#### GET /mess/photo
Get current mess photo.

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT /mess/photo
Update mess photo.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
photo: <file>
```

#### DELETE /mess/photo
Delete mess photo.

**Headers:**
```
Authorization: Bearer <token>
```

### Meal Plans

#### GET /meal-plan
Get meal plans.

**Headers:**
```
Authorization: Bearer <token>
```

#### POST /meal-plan
Create new meal plan.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date": "2024-01-01",
  "breakfast": "Breakfast menu",
  "lunch": "Lunch menu",
  "dinner": "Dinner menu",
  "notes": "Additional notes"
}
```

#### PUT /meal-plan/:id
Update meal plan.

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE /meal-plan/:id
Delete meal plan.

**Headers:**
```
Authorization: Bearer <token>
```

### Notifications

#### GET /notifications
Get user notifications.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `read` (optional): Filter by read status

#### PUT /notifications/:id/read
Mark notification as read.

**Headers:**
```
Authorization: Bearer <token>
```

#### DELETE /notifications/:id
Delete notification.

**Headers:**
```
Authorization: Bearer <token>
```

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 123456,
    "environment": "development",
    "version": "1.0.0",
    "services": {
      "database": "connected",
      "email": "connected",
      "cloudinary": "connected"
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `USER_EXISTS` | User already exists with this email |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `EMAIL_NOT_VERIFIED` | Email not verified |
| `INVALID_OTP` | Invalid or expired OTP |
| `USER_NOT_FOUND` | User not found |
| `VALIDATION_ERROR` | Input validation failed |
| `AUTHENTICATION_ERROR` | Authentication required |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 requests per 15 minutes
- File uploads: 10 requests per 15 minutes

## File Upload

Supported file types:
- Images: JPG, PNG, GIF, WebP
- Maximum size: 5MB

## Environment Variables

Required environment variables:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/SmartMess
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
OTP_EXPIRY_MINUTES=10
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Development

### Running the API

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

### Database Setup

```bash
# Run database scripts
npm run db:seed
npm run db:migrate
```

## Support

For API support and questions, please contact the development team. 

---

## 🐳 Docker & Deployment

- To run the backend and MongoDB using Docker Compose:

```bash
docker-compose up --build
```

- The backend is built from `backend/Dockerfile`.
- MongoDB data is persisted in a Docker volume.
- For more details, see `backend/README.md`. 