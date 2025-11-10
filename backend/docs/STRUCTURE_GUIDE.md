# Backend Structure Guide

## Overview
This document outlines the improved backend file structure for the SmartMess application, following best practices for scalability, maintainability, and team collaboration.

## Directory Structure

```
backend/
├── src/
│   ├── api/
│   ├── config/                  # Configuration files
│   ├── database/                # Database connection and utilities
│   ├── models/                  # MongoDB models
│   ├── services/                # Business logic services
│   ├── middleware/              # Global middleware
│   ├── utils/                   # Utility functions
│   ├── types/                   # TypeScript type definitions
│   ├── interfaces/              # TypeScript interfaces
│   ├── constants/               # Application constants
│   └── server.ts               # Main application entry point
├── tests/                       # Test files
├── docs/                        # Documentation
├── scripts/                     # Utility scripts
├── logs/                        # Application logs
├── uploads/                     # File uploads
└── dist/                        # Compiled code
```

## Key Improvements

### 1. **API Versioning**
- All API routes are now under `/api/v1/`
- Easy to add new versions without breaking existing clients
- Clear separation between API and internal code

### 2. **Separated Controllers**
- Large controllers broken down into smaller, focused files
- Each controller handles a specific feature
- Better maintainability and testability

### 3. **Centralized Constants**
- All application constants in one place
- Easy to modify and maintain
- Consistent messaging across the application

### 4. **Type Safety**
- Comprehensive TypeScript interfaces
- Better error handling with custom error classes
- Improved developer experience

### 5. **Enhanced Error Handling**
- Centralized error handling middleware
- Custom error classes for different scenarios
- Detailed logging for debugging

### 6. **Rate Limiting**
- Multiple rate limiters for different endpoints
- Protection against abuse and DDoS attacks
- Configurable limits per endpoint type

## File Organization

### Controllers
Controllers are now organized by feature:
```
src/api/v1/controllers/
├── auth/
│   ├── loginController.ts
│   ├── registerController.ts
│   └── otpController.ts
├── mess/
│   ├── messProfileController.ts
│   └── messPhotoController.ts
└── user/
    └── userController.ts
```

### Services
Business logic is separated into services:
```
src/services/
├── auth/
│   ├── authService.ts
│   └── jwtService.ts
├── email/
│   ├── emailService.ts
│   └── templates/
├── payment/
│   └── paymentService.ts
└── upload/
    └── cloudinaryService.ts
```

### Constants
All application constants are centralized:
```
src/constants/
├── messages.ts      # User-facing messages
├── statusCodes.ts   # HTTP status codes
├── config.ts        # Application configuration
└── index.ts         # Export all constants
```

## Migration Benefits

### Before (Issues)
- ❌ Large controller files (500+ lines)
- ❌ Mixed concerns in single files
- ❌ No API versioning
- ❌ Inconsistent error handling
- ❌ No rate limiting
- ❌ Scattered constants

### After (Improvements)
- ✅ Small, focused controllers
- ✅ Clear separation of concerns
- ✅ API versioning ready
- ✅ Centralized error handling
- ✅ Comprehensive rate limiting
- ✅ Centralized constants

## Usage Examples

### Adding a New API Endpoint

1. **Create Controller:**
```typescript
// src/api/v1/controllers/feature/featureController.ts
export class FeatureController {
  public async create(req: Request, res: Response): Promise<void> {
    // Implementation
  }
}
```

2. **Create Route:**
```typescript
// src/api/v1/routes/feature.ts
import { FeatureController } from '../controllers/feature/featureController';

const router = Router();
const controller = new FeatureController();

router.post('/create', controller.create.bind(controller));
export default router;
```

3. **Add to Main Routes:**
```typescript
// src/api/v1/routes/index.ts
import featureRoutes from './feature';

router.use('/feature', featureRoutes);
```

### Using Constants
```typescript
import { MESSAGES, STATUS_CODES } from '../constants';

res.status(STATUS_CODES.OK).json({
  success: true,
  message: MESSAGES.GENERAL.SUCCESS
});
```

### Error Handling
```typescript
import { CustomError } from '../middleware/errorHandler';

throw new CustomError('Resource not found', 404);
```

## Best Practices

1. **Keep Controllers Thin**
   - Controllers should only handle HTTP requests/responses
   - Business logic goes in services

2. **Use TypeScript Interfaces**
   - Define interfaces for all data structures
   - Maintain type safety throughout the application

3. **Centralize Constants**
   - All messages and status codes in constants
   - Easy to maintain and update

4. **Implement Proper Error Handling**
   - Use custom error classes
   - Log errors appropriately
   - Return consistent error responses

5. **Follow Naming Conventions**
   - Use PascalCase for classes
   - Use camelCase for functions and variables
   - Use kebab-case for file names

## Testing Structure

```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
└── e2e/              # End-to-end tests
```

## Environment Configuration

All configuration is centralized in `src/constants/config.ts` and can be overridden with environment variables.

## Next Steps

1. **Migrate Existing Code**
   - Move existing controllers to new structure
   - Update imports and references
   - Test all functionality

2. **Add Missing Features**
   - Implement remaining controllers
   - Add comprehensive validation
   - Enhance error handling

3. **Documentation**
   - Update API documentation
   - Add code comments
   - Create deployment guides

4. **Testing**
   - Add unit tests for new structure
   - Implement integration tests
   - Set up CI/CD pipeline 

---

## 🐳 Docker & Deployment

- The backend structure is designed for professional containerization and cloud deployment.
- To run the backend and MongoDB using Docker Compose:

```bash
docker-compose up --build
```

- The backend is built from `backend/Dockerfile`.
- MongoDB data is persisted in a Docker volume.
- For more details, see `backend/README.md`. 