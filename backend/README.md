# SmartMess Backend

A production-ready Node.js/Express.js backend API for the SmartMess application, built with TypeScript, MongoDB, and comprehensive security features.

## 🚀 Features

- **Security First**: Helmet.js, CORS, rate limiting, input validation
- **Production Ready**: Comprehensive logging, error handling, graceful shutdown
- **TypeScript**: Full type safety and modern JavaScript features
- **MongoDB**: Robust database with connection pooling and retry logic
- **Authentication**: JWT-based authentication with OTP verification
- **File Upload**: Cloudinary integration for image storage
- **Email Service**: Nodemailer integration for OTP and notifications
- **Validation**: Joi schema validation for all inputs
- **Testing**: Jest testing framework with coverage reporting

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB 5+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit .env with your configuration
   nano .env
   ```

4. **Required Environment Variables**
   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/SmartMess
   
   # JWT
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   JWT_EXPIRES_IN=30d
   
   # Email (Gmail example)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=noreply@yourdomain.com
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Security
   SESSION_SECRET=your-session-secret
   ```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 📁 Project Structure

```
src/
├── config/           # Configuration management
├── middleware/       # Express middleware
│   ├── requireAuth.ts
│   ├── security.ts   # Security middleware
│   └── validation.ts # Input validation
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utilities
│   ├── errorHandler.ts
│   └── logger.ts
├── scripts/         # Database scripts
├── tests/           # Test files
└── server.ts        # Main server file
```

## 🔐 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Request throttling
- **Input Validation**: Joi schema validation
- **Authentication**: JWT tokens
- **Password Hashing**: bcryptjs
- **SQL Injection Protection**: Mongoose ODM

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/send-otp` - Send OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password

### Users
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/change-password` - Change password

### Mess Management
- `GET /api/mess/profile` - Get mess profile
- `POST /api/mess/profile` - Create mess profile
- `PUT /api/mess/profile` - Update mess profile
- `POST /api/mess/photo` - Upload mess photo

### Meal Plans
- `GET /api/mess/meal-plans` - Get meal plans
- `POST /api/mess/meal-plans` - Create meal plan
- `PUT /api/mess/meal-plans/:id` - Update meal plan
- `DELETE /api/mess/meal-plans/:id` - Delete meal plan

### Notifications
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read

## 🧪 Testing

### Test Structure
```
tests/
├── integration/     # Integration tests
├── unit/           # Unit tests
└── fixtures/       # Test data
```

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/auth.test.ts

# Run tests with coverage
npm run test:coverage
```

## 📈 Monitoring & Logging

### Logging
- **Winston**: Structured logging
- **File Rotation**: Automatic log rotation
- **Error Tracking**: Comprehensive error logging

### Health Checks
- `GET /health` - Application health status

### Metrics
- Request/response logging
- Performance monitoring
- Error tracking

## 🚀 Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure email service
5. Set up Cloudinary credentials

### Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start ecosystem.config.js

# Using Docker
docker build -t SmartMess-backend .
docker run -p 5000:5000 SmartMess-backend
```

### Database Migration
```bash
# Run database scripts
npm run check-database
npm run insert-users
```

## 🔧 Development Scripts

```bash
# Database operations
npm run check-database
npm run insert-users
npm run create-test-user
npm run update-passwords

# Testing
npm run test-server-connection
npm run test-auth
```

## 📝 API Documentation

### Request/Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Error details
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@SmartMess.com or create an issue in the repository. 

## 🐳 Docker & Containerization

### Build and Run with Docker

```bash
# Build the backend image
cd backend
# Build the Docker image
docker build -t SmartMess-backend .

# Run the backend container
# (Make sure to set environment variables or mount .env file)
docker run -d --env-file .env -p 5000:5000 SmartMess-backend
```

### Using Docker Compose (Recommended for Full Stack)

A sample `docker-compose.yml` is provided at the project root for orchestrating backend, frontend, and database services:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "5000:5000"
    volumes:
      - ./backend/logs:/app/logs
      - ./backend/uploads:/app/uploads
    depends_on:
      - mongo
  mongo:
    image: mongo:5
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
```

- **Persistent Volumes:** Logs and uploads are persisted on the host for durability.
- **Environment Variables:** Use `.env` or `env_file` for secrets and configuration.
- **Production Best Practices:**
  - Use a secure `.env` file and never commit secrets to version control.
  - Use a process manager (e.g., PM2) or Docker restart policies for reliability.
  - Set `NODE_ENV=production` for production builds. 