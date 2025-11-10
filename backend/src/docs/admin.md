 # Admin Backend Documentation

## Overview

The admin backend provides comprehensive administrative functionality for the SmartMess application, including user management, analytics, reporting, and system administration.

## Architecture

The admin backend follows a layered architecture pattern:

```
Routes → Controllers → Services → Models
   ↓         ↓         ↓        ↓
Middleware → Utils → Types → Tests
```

## File Structure

```
backend/src/
├── routes/admin/
│   ├── index.ts              # Main admin routes barrel file
│   ├── userManagement.ts     # User management routes
│   ├── analytics.ts          # Analytics routes
│   ├── reports.ts            # Reporting routes
│   └── settings.ts           # System settings routes
├── controllers/admin.ts       # Admin route controllers
├── services/admin.ts          # Business logic layer
├── middleware/admin.ts        # Admin-specific middleware
├── utils/admin.ts             # Admin utility functions
├── types/admin.ts             # TypeScript interfaces
├── validators/admin.ts        # Input validation schemas
├── tests/admin.test.ts        # Test suite
└── docs/admin.md              # This documentation
```

## Features

### 1. User Management
- **View Users**: List all users with pagination and filtering
- **User Details**: Get detailed information about specific users
- **Update Users**: Modify user information and roles
- **Delete Users**: Remove users from the system
- **Verify Users**: Mark user accounts as verified
- **Suspend Users**: Temporarily disable user accounts
- **Role Management**: Change user roles and permissions

### 2. Analytics Dashboard
- **Overview Statistics**: Total users, messes, memberships
- **User Analytics**: Registration trends, role distribution, verification status
- **Mess Analytics**: Creation trends, status distribution, location analysis
- **Membership Analytics**: Growth trends, status distribution, payment analysis
- **Trend Analysis**: Time-based metrics for various entities

### 3. Reporting System
- **User Reports**: Comprehensive user statistics and data
- **Mess Reports**: Mess information and member details
- **Membership Reports**: Membership status and payment information
- **Financial Reports**: Payment trends and revenue analysis
- **Export Functionality**: JSON and CSV export options

### 4. System Administration
- **System Settings**: Application configuration and limits
- **Security Settings**: Authentication, password policies, rate limiting
- **Email Configuration**: SMTP settings and template management
- **Notification Settings**: Push, email, SMS, and in-app notifications
- **Backup Management**: System backup creation and management
- **Maintenance Mode**: System maintenance control

## API Endpoints

### Authentication & Authorization
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/profile` - Get admin profile
- `PUT /api/admin/auth/profile` - Update admin profile
- `POST /api/admin/auth/change-password` - Change admin password
- `POST /api/admin/auth/logout` - Admin logout

### User Management
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user
- `PUT /api/admin/users/:userId/verify` - Verify user
- `PUT /api/admin/users/:userId/role` - Change user role
- `POST /api/admin/users/:userId/suspend` - Suspend user
- `POST /api/admin/users/:userId/unsuspend` - Unsuspend user

### Analytics
- `GET /api/admin/analytics/dashboard` - Dashboard overview
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/analytics/messes` - Mess analytics
- `GET /api/admin/analytics/memberships` - Membership analytics
- `GET /api/admin/analytics/trends` - Trend analysis

### Reports
- `GET /api/admin/reports/users` - User reports
- `GET /api/admin/reports/messes` - Mess reports
- `GET /api/admin/reports/memberships` - Membership reports
- `GET /api/admin/reports/financial` - Financial reports
- `GET /api/admin/reports/export/:type` - Export data

### Settings
- `GET /api/admin/settings/system` - System settings
- `PUT /api/admin/settings/system` - Update system settings
- `GET /api/admin/settings/security` - Security settings
- `PUT /api/admin/settings/security` - Update security settings
- `GET /api/admin/settings/email` - Email settings
- `PUT /api/admin/settings/email` - Update email settings
- `GET /api/admin/settings/notifications` - Notification settings
- `PUT /api/admin/settings/notifications` - Update notification settings
- `POST /api/admin/settings/test-email` - Test email configuration
- `POST /api/admin/settings/backup` - Create backup
- `GET /api/admin/settings/backups` - List backups

## Middleware

### Authentication Middleware
- `requireAuth` - Ensures user is authenticated
- `requireAdmin` - Ensures user has admin privileges
- `requireSuperAdmin` - Ensures user has super admin privileges

### Security Middleware
- `preventSelfModification` - Prevents admins from modifying themselves
- `preventSelfDeletion` - Prevents admins from deleting themselves
- `preventSelfRoleChange` - Prevents admins from changing their own role
- `validateAdminInput` - Sanitizes and validates admin input
- `adminRateLimiter` - Rate limits admin actions

### Utility Middleware
- `logAdminAction` - Logs admin actions for audit purposes
- `checkMaintenanceMode` - Checks if system is in maintenance mode
- `addAdminContext` - Adds admin context to request object

## Services

### AdminService
The main service class that handles business logic:

- `getDashboardData()` - Retrieves dashboard statistics
- `getUserAnalytics(period)` - Gets user analytics for specified period
- `getMessAnalytics(period)` - Gets mess analytics for specified period
- `getMembershipAnalytics(period)` - Gets membership analytics for specified period
- `getUsersWithFilters(filters, page, limit)` - Gets users with filtering and pagination
- `getMessesWithFilters(filters, page, limit)` - Gets messes with filtering and pagination
- `getSystemHealth()` - Gets system health information
- `createBackup(type, adminId)` - Creates system backup
- `testEmailConfiguration(email)` - Tests email configuration

## Types & Interfaces

### Core Admin Types
- `IAdminUser` - Admin user information
- `IAdminDashboard` - Dashboard data structure
- `IUserAnalytics` - User analytics data
- `IMessAnalytics` - Mess analytics data
- `IMembershipAnalytics` - Membership analytics data
- `IFinancialAnalytics` - Financial analytics data

### Report Types
- `IUserReport` - User report structure
- `IMessReport` - Mess report structure
- `IMembershipReport` - Membership report structure

### Settings Types
- `ISystemSettings` - System configuration
- `ISecuritySettings` - Security configuration
- `IEmailSettings` - Email configuration
- `INotificationSettings` - Notification configuration

## Validation

### Input Validation
All admin endpoints use comprehensive validation schemas:

- `validateUserUpdate` - User update validation
- `validateUserBulkAction` - Bulk user action validation
- `validateAnalyticsQuery` - Analytics query validation
- `validateReportQuery` - Report query validation
- `validateSystemSettings` - System settings validation
- `validateSecuritySettings` - Security settings validation
- `validateEmailSettings` - Email settings validation

### Security Validation
- Input sanitization to prevent injection attacks
- Role-based access control
- Permission validation
- Rate limiting for sensitive operations

## Error Handling

### Standard Error Responses
All admin endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors if applicable
}
```

### Success Responses
Successful operations return:

```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Success message" // Optional
}
```

## Security Features

### Authentication
- JWT-based authentication
- Role-based access control
- Session management

### Authorization
- Admin privilege verification
- Permission-based access control
- Action logging and audit trails

### Input Security
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

### Rate Limiting
- API rate limiting
- Admin action rate limiting
- Brute force protection

## Testing

### Test Coverage
The admin backend includes comprehensive test coverage:

- Unit tests for services
- Controller tests
- Middleware tests
- Utility function tests
- Integration tests

### Test Structure
- Mock data and models
- Test utilities and helpers
- Test database setup
- Cleanup procedures

## Configuration

### Environment Variables
Required environment variables for admin functionality:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/SmartMess

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# Email
EMAIL_PROVIDER=nodemailer
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Admin Settings
ADMIN_EMAIL=admin@SmartMess.com
ADMIN_PASSWORD=secure-password
```

### Database Configuration
- MongoDB connection with connection pooling
- Index optimization for analytics queries
- Data validation and constraints

## Performance Considerations

### Database Optimization
- Aggregation pipeline optimization
- Index usage for analytics queries
- Connection pooling
- Query result caching

### API Optimization
- Response compression
- Pagination for large datasets
- Efficient data serialization
- Background processing for heavy operations

## Monitoring & Logging

### Application Logging
- Structured logging with Winston
- Log levels and filtering
- Log rotation and retention

### Performance Monitoring
- Response time tracking
- Error rate monitoring
- Database query performance
- Memory and CPU usage

### Audit Logging
- Admin action logging
- User activity tracking
- Security event logging
- Compliance reporting

## Deployment

### Production Considerations
- Environment-specific configuration
- Security hardening
- Performance optimization
- Monitoring and alerting

### Docker Support
- Containerized deployment
- Environment variable management
- Health check endpoints
- Graceful shutdown handling

## Future Enhancements

### Planned Features
- Real-time analytics dashboard
- Advanced reporting tools
- Automated backup scheduling
- Enhanced security features
- Performance optimization tools

### Scalability Improvements
- Microservices architecture
- Load balancing
- Database sharding
- Caching strategies

## Support & Maintenance

### Troubleshooting
Common issues and solutions for admin functionality:

1. **Authentication Issues**
   - Verify JWT token validity
   - Check user role permissions
   - Validate session state

2. **Database Connection Issues**
   - Check MongoDB connection string
   - Verify network connectivity
   - Check database permissions

3. **Performance Issues**
   - Review database indexes
   - Check query optimization
   - Monitor resource usage

### Maintenance Procedures
- Regular backup scheduling
- Database optimization
- Log rotation and cleanup
- Security updates and patches

## Contributing

### Development Guidelines
- Follow TypeScript best practices
- Maintain consistent code style
- Write comprehensive tests
- Update documentation

### Code Review Process
- Peer review requirements
- Testing requirements
- Documentation updates
- Security review

---

For additional information or support, please refer to the main project documentation or contact the development team.