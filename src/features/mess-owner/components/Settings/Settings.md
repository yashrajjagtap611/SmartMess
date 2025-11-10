# SmartMess Settings Module Documentation

## Overview

The Settings module provides comprehensive configuration management for mess owners in the SmartMess application. It includes five main settings categories: Meal Plans, Mess Profile, Operating Hours, Payment Settings, and Security Settings.

## Architecture

### Directory Structure

```
src/features/mess-owner/components/Settings/
├── Settings.md                    # This documentation file
├── index.tsx                      # Main routing component
├── MealPlan/                      # Meal plan management
│   ├── MealPlan.tsx              # Main component
│   ├── MealPlan.types.ts         # TypeScript interfaces
│   ├── MealPlan.hooks.ts         # Custom hooks
│   ├── MealPlan.utils.ts         # Utility functions
│   ├── MealPlan.test.tsx         # Unit tests
│   ├── index.ts                  # Module exports
│   ├── index.tsx                 # Component export
│   └── components/               # Sub-components
├── MessProfile/                   # Mess profile management
│   ├── MessProfile.tsx           # Main component
│   ├── MessProfile.types.ts      # TypeScript interfaces
│   ├── MessProfile.hooks.ts      # Custom hooks
│   ├── MessProfile.utils.ts      # Utility functions
│   ├── MessProfile.test.tsx      # Unit tests
│   ├── index.ts                  # Module exports
│   ├── index.tsx                 # Component export
│   └── components/               # Sub-components
├── OperatingHours/               # Operating hours management
│   ├── OperatingHours.tsx        # Main component
│   ├── OperatingHours.types.ts   # TypeScript interfaces
│   ├── OperatingHours.hooks.ts   # Custom hooks
│   ├── OperatingHours.utils.ts   # Utility functions
│   ├── OperatingHours.test.tsx   # Unit tests
│   ├── index.ts                  # Module exports
│   ├── index.tsx                 # Component export
│   └── components/               # Sub-components
├── Payment/                      # Payment settings management
│   ├── Payment.tsx               # Main component
│   ├── Payment.types.ts          # TypeScript interfaces
│   ├── Payment.hooks.ts          # Custom hooks
│   ├── Payment.utils.ts          # Utility functions
│   ├── Payment.test.tsx          # Unit tests
│   ├── index.ts                  # Module exports
│   ├── index.tsx                 # Component export
│   └── components/               # Sub-components
└── Security/                     # Security settings management
    ├── Security.tsx              # Main component
    ├── Security.types.ts         # TypeScript interfaces
    ├── Security.hooks.ts         # Custom hooks
    ├── Security.utils.ts         # Utility functions
    ├── Security.test.tsx         # Unit tests
    ├── index.ts                  # Module exports
    ├── index.tsx                 # Component export
    └── components/               # Sub-components
```

### Routing Configuration

The main Settings component uses React Router for navigation:

```typescript
// Routes configuration in index.tsx
<Routes>
  <Route path="/mess-plans/*" element={<MealPlan />} />
  <Route path="/mess-profile" element={<MessProfile />} />
  <Route path="/operating-hours" element={<OperatingHours />} />
  <Route path="/payment" element={<Payment />} />
  <Route path="/security" element={<Security />} />
</Routes>
```

## Features

### 1. Meal Plan Management

**Purpose**: Configure meal plans, pricing, and leave policies for mess members.

**Key Features**:
- Create, update, and delete meal plans
- Configure pricing with different periods (day/week/month/year)
- Set meal options (breakfast, lunch, dinner)
- Define leave rules and policies
- Manage meal plan activation status

**Core Types**:
```typescript
interface MealPlan {
  _id?: string;
  name: string;
  pricing: {
    amount: number;
    period: "day" | "week" | "15days" | "month" | "3months" | "6months" | "year";
  };
  mealType: string;
  mealsPerDay: number;
  mealOptions: {
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
  };
  description: string;
  isActive: boolean;
  leaveRules: LeaveRules;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LeaveRules {
  maxLeaveDays: number;
  maxLeaveMeals: number;
  requireTwoHourNotice: boolean;
  noticeHours: number;
  minConsecutiveDays: number;
  extendSubscription: boolean;
  autoApproval: boolean;
  leaveLimitsEnabled: boolean;
  consecutiveLeaveEnabled: boolean;
  maxLeaveDaysEnabled: boolean;
  maxLeaveMealsEnabled: boolean;
}
```

**API Endpoints**:
- `GET /api/mess/meal-plans` - Get all meal plans
- `GET /api/mess/meal-plans/:id` - Get specific meal plan
- `POST /api/mess/meal-plans` - Create new meal plan
- `PUT /api/mess/meal-plans/:id` - Update meal plan
- `DELETE /api/mess/meal-plans/:id` - Delete meal plan

### 2. Mess Profile Management

**Purpose**: Manage mess information, location, and branding.

**Key Features**:
- Update mess name and description
- Configure mess types and categories
- Manage location information
- Upload and manage mess logo/photo
- Associate with colleges/institutions
- Update owner contact information

**Core Types**:
```typescript
interface MessProfileData {
  name: string;
  types: string[];
  location: LocationData;
  colleges: string[];
  collegeInput: string;
  ownerPhone: string;
  ownerEmail: string;
}

interface LocationData {
  street: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  country: string;
}
```

**API Endpoints**:
- `GET /api/mess/profile` - Get mess profile
- `POST /api/mess/profile` - Create mess profile
- `PUT /api/mess/profile` - Update mess profile
- `GET /api/mess/profile/photo` - Get mess photo
- `PUT /api/mess/profile/photo` - Update mess photo
- `POST /api/mess/photo` - Upload new photo
- `DELETE /api/mess/photo` - Delete photo

### 3. Operating Hours Management

**Purpose**: Configure meal service timings and availability.

**Key Features**:
- Set breakfast, lunch, and dinner timings
- Enable/disable specific meals
- Validate time ranges
- Real-time updates

**Core Types**:
```typescript
interface OperatingHour {
  meal: string;
  enabled: boolean;
  start: string;
  end: string;
}
```

**API Endpoints**:
- `GET /api/mess/operating-hours` - Get operating hours
- `PUT /api/mess/operating-hours` - Update operating hours

### 4. Payment Settings Management

**Purpose**: Configure payment methods and billing preferences.

**Key Features**:
- Set UPI ID for digital payments
- Configure bank account details
- Enable/disable automatic payments
- Configure late fee settings
- Toggle cash payment acceptance

**Core Types**:
```typescript
interface PaymentSettings {
  upiId: string;
  bankAccount: string;
  autoPayment: boolean;
  lateFee: boolean;
  lateFeeAmount: number;
  isCashPayment: boolean;
}
```

**API Endpoints**:
- `GET /api/mess/payment-settings` - Get payment settings
- `PUT /api/mess/payment-settings` - Update payment settings

### 5. Security Settings Management

**Purpose**: Manage privacy settings and password security.

**Key Features**:
- Control profile visibility
- Manage contact information visibility
- Configure ratings visibility
- Change password functionality
- Privacy controls

**Core Types**:
```typescript
interface SecurityState {
  profileVisible: boolean;
  contactVisible: boolean;
  ratingsVisible: boolean;
  currentPassword: string;
  newPassword: string;
  showCurrentPassword: boolean;
  showNewPassword: boolean;
}
```

**API Endpoints**:
- `GET /api/mess/security-settings` - Get security settings
- `PUT /api/mess/security-settings` - Update security settings
- `POST /api/auth/change-password` - Change password

## Technical Implementation

### State Management

Each settings module uses custom hooks for state management:

- **useMealPlan**: Manages meal plan CRUD operations
- **useMessProfileScreen**: Handles mess profile updates with photo upload
- **useOperatingHours**: Manages operating hours configuration
- **usePaymentSettings**: Handles payment configuration
- **useSecuritySettings**: Manages security and privacy settings

### Validation & Error Handling

All modules implement comprehensive validation:

- Form validation with real-time feedback
- API error handling with user-friendly messages
- Toast notifications for success/error states
- Loading states during API operations

### File Upload

The MessProfile module includes advanced file upload capabilities:

- Cloudinary integration for image storage
- Progress tracking during upload
- Image validation and compression
- Error handling for upload failures

### Context Integration

The settings modules integrate with various contexts:

- **MessProfileContext**: Global mess profile state
- **UserContext**: Authentication and user data
- **ThemeContext**: Dark/light mode support
- **NotificationContext**: Toast notifications

## API Integration

### Service Layer

All API calls are handled through the `messService` class:

```typescript
// Example service methods
class MessService {
  async getMealPlans(): Promise<MessResponse>
  async createMealPlan(data: Partial<MealPlan>): Promise<MessResponse>
  async updateMealPlan(id: string, data: Partial<MealPlan>): Promise<MessResponse>
  async deleteMealPlan(id: string): Promise<MessResponse>
  async getMessDetails(): Promise<MessResponse>
  async updateMessDetails(data: Partial<Mess>): Promise<MessResponse>
  async getPaymentSettings(): Promise<MessResponse>
  async updatePaymentSettings(data: PaymentSettings): Promise<MessResponse>
  // ... more methods
}
```

### Authentication

All API endpoints require authentication:

- JWT token validation
- Role-based access control (mess-owner role required)
- Automatic token refresh handling
- Logout on authentication failures

## Backend API Endpoints

### Meal Plan Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mess/meal-plans` | Get all meal plans for the mess |
| GET | `/api/mess/meal-plans/:id` | Get specific meal plan by ID |
| POST | `/api/mess/meal-plans` | Create new meal plan |
| PUT | `/api/mess/meal-plans/:id` | Update existing meal plan |
| DELETE | `/api/mess/meal-plans/:id` | Delete meal plan |

### Mess Profile Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mess/profile` | Get mess profile |
| POST | `/api/mess/profile` | Create mess profile |
| PUT | `/api/mess/profile` | Update mess profile |
| GET | `/api/mess/profile/photo` | Get mess photo URL |
| PUT | `/api/mess/profile/photo` | Update mess photo |
| POST | `/api/mess/photo` | Upload new photo |
| DELETE | `/api/mess/photo` | Delete photo |

### Operating Hours Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mess/operating-hours` | Get current operating hours |
| PUT | `/api/mess/operating-hours` | Update operating hours |

### Payment Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mess/payment-settings` | Get payment settings |
| PUT | `/api/mess/payment-settings` | Update payment settings |

### Security Settings Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mess/security-settings` | Get security settings |
| PUT | `/api/mess/security-settings` | Update security settings |
| POST | `/api/auth/change-password` | Change user password |

## Error Handling

### Frontend Error Handling

- **Validation Errors**: Real-time form validation with field-specific error messages
- **API Errors**: Centralized error handling with user-friendly messages
- **Network Errors**: Retry mechanisms and offline state handling
- **Authentication Errors**: Automatic logout and redirect to login

### Backend Error Responses

All endpoints return standardized error responses:

```typescript
interface MessResponse {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Testing

### Unit Tests

Each module includes comprehensive unit tests:

- Component rendering tests
- Hook functionality tests
- Utility function tests
- Error scenario testing

### Test Files

- `MealPlan.test.tsx` - Meal plan component tests
- `MessProfile.test.tsx` - Mess profile component tests
- Additional test files for other modules

## Security Considerations

### Authentication & Authorization

- JWT token-based authentication
- Role-based access control (mess-owner role required)
- Secure token storage and transmission
- Automatic session management

### Data Validation

- Frontend form validation
- Backend API validation
- SQL injection prevention
- XSS protection

### File Upload Security

- File type validation
- File size limits
- Secure cloud storage (Cloudinary)
- Image processing and optimization

## Performance Optimizations

### Frontend Optimizations

- React.memo for component memoization
- Custom hooks for state management
- Lazy loading of components
- Optimized re-renders

### Backend Optimizations

- Database indexing
- Query optimization
- Caching strategies
- Rate limiting

## Future Enhancements

### Planned Features

1. **Advanced Meal Planning**
   - Recurring meal schedules
   - Seasonal menu management
   - Nutritional information tracking

2. **Enhanced Analytics**
   - Usage statistics
   - Revenue analytics
   - Member engagement metrics

3. **Integration Features**
   - Third-party payment gateways
   - SMS/WhatsApp notifications
   - Calendar integrations

4. **Mobile Optimizations**
   - Progressive Web App features
   - Offline functionality
   - Push notifications

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check JWT token validity
   - Verify user role permissions
   - Clear browser cache/localStorage

2. **File Upload Issues**
   - Check file size and format
   - Verify Cloudinary configuration
   - Check network connectivity

3. **Form Validation Errors**
   - Review required field validation
   - Check data format requirements
   - Verify API response handling

### Debug Mode

Enable debug mode by setting environment variables:
```bash
REACT_APP_DEBUG=true
REACT_APP_API_DEBUG=true
```

## Contributing

### Development Guidelines

1. Follow TypeScript best practices
2. Implement comprehensive error handling
3. Add unit tests for new features
4. Update documentation for API changes
5. Follow the established file structure pattern

### Code Style

- Use TypeScript interfaces for type safety
- Implement custom hooks for reusable logic
- Follow React best practices
- Use consistent naming conventions

---

*Last updated: 2025-01-29*
*Version: 1.0.0*