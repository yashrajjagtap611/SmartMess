export const MESSAGES = {
  // Auth Messages
  AUTH: {
    LOGIN_SUCCESS: 'Login successful',
    LOGIN_FAILED: 'Invalid credentials',
    REGISTER_SUCCESS: 'Registration successful',
    LOGOUT_SUCCESS: 'Logout successful',
    PASSWORD_RESET_EMAIL_SENT: 'Password reset email sent',
    PASSWORD_RESET_SUCCESS: 'Password reset successful',
    OTP_SENT: 'OTP sent successfully',
    OTP_VERIFIED: 'OTP verified successfully',
    OTP_EXPIRED: 'OTP has expired',
    OTP_INVALID: 'Invalid OTP',
    INVALID_OR_EXPIRED_OTP: 'Invalid or expired OTP',
    TOKEN_EXPIRED: 'Token has expired',
    TOKEN_INVALID: 'Invalid token',
    UNAUTHORIZED: 'Unauthorized access',
    EMAIL_REQUIRED: 'Email is required',
    EMAIL_AND_OTP_REQUIRED: 'Email and OTP are required',
    ALL_FIELDS_REQUIRED: 'All fields are required',
    PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
    USER_NOT_FOUND: 'User not found',
    GOOGLE_TOKEN_REQUIRED: 'Google token is required',
    GOOGLE_LOGIN_SUCCESS: 'Google login successful',
    GOOGLE_LOGIN_FAILED: 'Google login failed',
  },

  // User Messages
  USER: {
    CREATED: 'User created successfully',
    UPDATED: 'User updated successfully',
    DELETED: 'User deleted successfully',
    NOT_FOUND: 'User not found',
    ALREADY_EXISTS: 'User already exists',
    PROFILE_UPDATED: 'Profile updated successfully',
  },

  // Mess Messages
  MESS: {
    CREATED: 'Mess created successfully',
    UPDATED: 'Mess updated successfully',
    DELETED: 'Mess deleted successfully',
    NOT_FOUND: 'Mess not found',
    PROFILE_UPDATED: 'Mess profile updated successfully',
    PHOTO_UPLOADED: 'Mess photo uploaded successfully',
  },

  // General Messages
  GENERAL: {
    SUCCESS: 'Operation completed successfully',
    ERROR: 'An error occurred',
    VALIDATION_ERROR: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
    INTERNAL_ERROR: 'Internal server error',
    NOT_FOUND: 'Resource not found',
    FORBIDDEN: 'Access forbidden',
  },

  // Email Messages
  EMAIL: {
    SENT: 'Email sent successfully',
    FAILED: 'Failed to send email',
    SEND_FAILED: 'Failed to send email',
  },

  // File Upload Messages
  UPLOAD: {
    SUCCESS: 'File uploaded successfully',
    FAILED: 'File upload failed',
    INVALID_TYPE: 'Invalid file type',
    TOO_LARGE: 'File too large',
  },
}; 