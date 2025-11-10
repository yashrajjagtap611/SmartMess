# SmartMess Backend API Endpoints

## Mess Profile Management

### Base URL
```
http://localhost:5000/api
```

### Authentication
All endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Mess Profile Endpoints

### GET /api/mess/profile
**Description:** Retrieve the current user's mess profile

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200):**
```json
{
  "name": "The Green Mess",
  "location": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "district": "Mumbai Suburban",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "colleges": [
    "Mumbai University",
    "IIT Bombay"
  ],
  "ownerPhone": "+91-9876543210",
  "ownerEmail": "owner@greenmess.com",
  "types": ["Veg", "Mixed"],
  "logo": "https://cloudinary.com/image/url.jpg"
}
```

**Response (404):**
```json
{
  "message": "Mess profile not found"
}
```

---

### POST /api/mess/profile
**Description:** Create a new mess profile

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "The Green Mess",
  "location": {
    "street": "123 Main Street",
    "city": "Mumbai",
    "district": "Mumbai Suburban",
    "state": "Maharashtra",
    "pincode": "400001",
    "country": "India"
  },
  "colleges": [
    "Mumbai University",
    "IIT Bombay"
  ],
  "ownerPhone": "+91-9876543210",
  "ownerEmail": "owner@greenmess.com",
  "types": ["Veg", "Mixed"],
  "logo": "https://cloudinary.com/image/url.jpg"
}
```

**Validation Rules:**
- `name`: Required, 2-100 characters
- `location.city`: Required
- `location.state`: Required
- `location.pincode`: Required, 6 digits
- `ownerEmail`: Required, valid email format
- `colleges`: Required, at least one college
- `types`: Required, at least one type
- `ownerPhone`: Optional, valid phone format if provided

**Response (201):**
```json
{
  "message": "Mess profile created successfully",
  "profile": {
    // Same as GET response
  }
}
```

**Response (400):**
```json
{
  "message": "Validation failed",
  "errors": [
    "Mess name is required",
    "City is required",
    "Pincode must be 6 digits"
  ]
}
```

---

### PUT /api/mess/profile
**Description:** Update existing mess profile

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (Partial updates allowed)
```json
{
  "name": "Updated Mess Name",
  "location": {
    "city": "Updated City"
  },
  "colleges": ["New College"]
}
```

**Response (200):**
```json
{
  "message": "Mess profile updated successfully",
  "profile": {
    // Updated profile data
  }
}
```

---

### DELETE /api/mess/profile
**Description:** Delete mess profile

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Mess profile deleted successfully"
}
```

---

## 2. Mess Photo Endpoints

### GET /api/mess/photo
**Description:** Get mess photo URL

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "url": "https://cloudinary.com/image/url.jpg"
}
```

**Response (404):**
```json
{
  "message": "No photo found"
}
```

---

### POST /api/mess/photo
**Description:** Upload new mess photo

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData with 'photo' field containing image file
```

**Response (201):**
```json
{
  "message": "Photo uploaded successfully",
  "url": "https://cloudinary.com/image/url.jpg"
}
```

---

### PUT /api/mess/photo
**Description:** Update existing mess photo

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData with 'photo' field containing image file
```

**Response (200):**
```json
{
  "message": "Photo updated successfully",
  "url": "https://cloudinary.com/image/url.jpg"
}
```

---

### DELETE /api/mess/photo
**Description:** Delete mess photo

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Photo deleted successfully"
}
```

---

## 3. Error Responses

### Rate Limit Exceeded (429)
```json
{
  "message": "Rate limit exceeded",
  "retryAfter": 5000
}
```

### Unauthorized (401)
```json
{
  "message": "Unauthorized access"
}
```

### Forbidden (403)
```json
{
  "message": "Access forbidden"
}
```

### Internal Server Error (500)
```json
{
  "message": "Internal server error"
}
```

---

## 4. Database Schema

### Mess Profile Table
```sql
CREATE TABLE mess_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  street VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(6) NOT NULL,
  country VARCHAR(100) DEFAULT 'India',
  owner_phone VARCHAR(20),
  owner_email VARCHAR(255) NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Mess Colleges Table
```sql
CREATE TABLE mess_colleges (
  id SERIAL PRIMARY KEY,
  mess_profile_id INTEGER REFERENCES mess_profiles(id) ON DELETE CASCADE,
  college_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Mess Types Table
```sql
CREATE TABLE mess_types (
  id SERIAL PRIMARY KEY,
  mess_profile_id INTEGER REFERENCES mess_profiles(id) ON DELETE CASCADE,
  type_name VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. Implementation Notes

### Validation
- Implement comprehensive validation for all fields
- Use appropriate regex patterns for email, phone, and pincode
- Ensure data sanitization before database operations

### Security
- Implement rate limiting (10 requests/minute for photos, 20 for profiles)
- Validate file uploads (images only, max 5MB)
- Sanitize all user inputs
- Use prepared statements for database queries

### Performance
- Implement caching for frequently accessed data
- Use database indexes on user_id and frequently queried fields
- Optimize image uploads with compression

### Error Handling
- Provide meaningful error messages
- Log errors for debugging
- Implement proper HTTP status codes
- Handle edge cases gracefully 