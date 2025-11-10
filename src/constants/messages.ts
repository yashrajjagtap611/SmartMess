// Message Constants

// Success Messages
export const SUCCESS_MESSAGES = {
  // Auth
  LOGIN_SUCCESS: 'Successfully logged in!',
  REGISTER_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully!',
  PROFILE_UPDATE_SUCCESS: 'Profile updated successfully!',
  OTP_VERIFIED: 'OTP verified successfully!',
  OTP_SENT: 'OTP sent to your email!',

  // Mess
  MESS_PROFILE_SAVED: 'Mess profile saved successfully!',
  MESS_PHOTO_UPLOADED: 'Photo uploaded successfully!',
  MESS_PHOTO_DELETED: 'Photo deleted successfully!',
  MESS_SETTINGS_SAVED: 'Settings saved successfully!',

  // User
  USER_CREATED: 'User created successfully!',
  USER_UPDATED: 'User updated successfully!',
  USER_DELETED: 'User deleted successfully!',
  MEMBERSHIP_JOINED: 'Successfully joined the mess!',
  MEMBERSHIP_LEFT: 'Successfully left the mess!',

  // Meal Plans
  MEAL_PLAN_CREATED: 'Meal plan created successfully!',
  MEAL_PLAN_UPDATED: 'Meal plan updated successfully!',
  MEAL_PLAN_DELETED: 'Meal plan deleted successfully!',

  // Payments
  PAYMENT_SUCCESS: 'Payment completed successfully!',
  PAYMENT_PENDING: 'Payment is pending verification!',
  PAYMENT_CANCELLED: 'Payment cancelled successfully!',

  // Notifications
  NOTIFICATION_MARKED_READ: 'Notification marked as read!',
  ALL_NOTIFICATIONS_READ: 'All notifications marked as read!',
  NOTIFICATION_DELETED: 'Notification deleted successfully!',

  // Feedback
  FEEDBACK_SUBMITTED: 'Feedback submitted successfully!',
  FEEDBACK_UPDATED: 'Feedback updated successfully!',
  FEEDBACK_RESOLVED: 'Feedback marked as resolved!',

  // Leave Requests
  LEAVE_REQUEST_SUBMITTED: 'Leave request submitted successfully!',
  LEAVE_REQUEST_APPROVED: 'Leave request approved!',
  LEAVE_REQUEST_REJECTED: 'Leave request rejected!',

  // General
  DATA_SAVED: 'Data saved successfully!',
  DATA_DELETED: 'Data deleted successfully!',
  OPERATION_SUCCESS: 'Operation completed successfully!',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password!',
  EMAIL_ALREADY_EXISTS: 'Email already exists!',
  INVALID_OTP: 'Invalid OTP!',
  OTP_EXPIRED: 'OTP has expired!',
  PASSWORD_MISMATCH: 'Passwords do not match!',
  WEAK_PASSWORD: 'Password is too weak!',
  INVALID_EMAIL: 'Please enter a valid email address!',

  // Network
  NETWORK_ERROR: 'Network error. Please check your connection!',
  SERVER_ERROR: 'Server error. Please try again later!',
  TIMEOUT_ERROR: 'Request timed out. Please try again!',
  UNAUTHORIZED: 'You are not authorized to perform this action!',
  FORBIDDEN: 'Access denied. You do not have permission!',
  NOT_FOUND: 'The requested resource was not found!',

  // Validation
  REQUIRED_FIELD: 'This field is required!',
  INVALID_FORMAT: 'Invalid format!',
  MIN_LENGTH: 'Minimum length is {min} characters!',
  MAX_LENGTH: 'Maximum length is {max} characters!',
  INVALID_PHONE: 'Please enter a valid phone number!',
  INVALID_PINCODE: 'Please enter a valid pincode!',

  // File Upload
  FILE_TOO_LARGE: 'File size is too large!',
  INVALID_FILE_TYPE: 'Invalid file type!',
  UPLOAD_FAILED: 'File upload failed!',

  // Mess
  MESS_NOT_FOUND: 'Mess not found!',
  MESS_ALREADY_EXISTS: 'Mess already exists!',
  MESS_SAVE_FAILED: 'Failed to save mess profile!',
  MESS_PHOTO_UPLOAD_FAILED: 'Failed to upload photo!',

  // User
  USER_NOT_FOUND: 'User not found!',
  USER_ALREADY_EXISTS: 'User already exists!',
  USER_UPDATE_FAILED: 'Failed to update user!',
  USER_DELETE_FAILED: 'Failed to delete user!',

  // Membership
  ALREADY_MEMBER: 'You are already a member of this mess!',
  NOT_MEMBER: 'You are not a member of this mess!',
  MEMBERSHIP_FAILED: 'Failed to process membership!',

  // Meal Plans
  MEAL_PLAN_NOT_FOUND: 'Meal plan not found!',
  MEAL_PLAN_CREATE_FAILED: 'Failed to create meal plan!',
  MEAL_PLAN_UPDATE_FAILED: 'Failed to update meal plan!',

  // Payments
  PAYMENT_FAILED: 'Payment failed!',
  PAYMENT_NOT_FOUND: 'Payment not found!',
  INSUFFICIENT_BALANCE: 'Insufficient balance!',

  // General
  OPERATION_FAILED: 'Operation failed!',
  UNKNOWN_ERROR: 'An unknown error occurred!',
  VALIDATION_ERROR: 'Please check your input and try again!',
} as const;

// Warning Messages
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: 'You have unsaved changes. Are you sure you want to leave?',
  DELETE_CONFIRMATION: 'Are you sure you want to delete this item?',
  LOGOUT_CONFIRMATION: 'Are you sure you want to logout?',
  LEAVE_MESS_CONFIRMATION: 'Are you sure you want to leave this mess?',
  CANCEL_PAYMENT: 'Are you sure you want to cancel this payment?',
  RESET_FORM: 'Are you sure you want to reset the form?',
} as const;

// Info Messages
export const INFO_MESSAGES = {
  LOADING: 'Loading...',
  SAVING: 'Saving...',
  UPLOADING: 'Uploading...',
  PROCESSING: 'Processing...',
  NO_DATA: 'No data available!',
  NO_RESULTS: 'No results found!',
  SEARCHING: 'Searching...',
  CONNECTING: 'Connecting...',
  SYNCING: 'Syncing...',
} as const;

// Form Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD: 'Password must be at least 8 characters long',
  CONFIRM_PASSWORD: 'Passwords must match',
  PHONE: 'Please enter a valid phone number',
  PINCODE: 'Please enter a valid pincode',
  MIN_LENGTH: 'Minimum {min} characters required',
  MAX_LENGTH: 'Maximum {max} characters allowed',
  MIN_VALUE: 'Minimum value is {min}',
  MAX_VALUE: 'Maximum value is {max}',
  PATTERN: 'Please enter a valid format',
  UNIQUE: 'This value must be unique',
  FUTURE_DATE: 'Date must be in the future',
  PAST_DATE: 'Date must be in the past',
} as const;

// Notification Messages
export const NOTIFICATION_MESSAGES = {
  NEW_MEMBER: 'New member joined your mess!',
  PAYMENT_RECEIVED: 'Payment received from {user}!',
  LEAVE_REQUEST: 'New leave request from {user}!',
  FEEDBACK_RECEIVED: 'New feedback received!',
  MEAL_PLAN_UPDATED: 'Meal plan has been updated!',
  PAYMENT_DUE: 'Payment is due in {days} days!',
  SYSTEM_MAINTENANCE: 'System maintenance scheduled for {time}!',
} as const;

// Placeholder Messages
export const PLACEHOLDER_MESSAGES = {
  SEARCH: 'Search...',
  ENTER_EMAIL: 'Enter your email address',
  ENTER_PASSWORD: 'Enter your password',
  ENTER_NAME: 'Enter your full name',
  ENTER_PHONE: 'Enter your phone number',
  ENTER_MESS_NAME: 'Enter mess name',
  ENTER_ADDRESS: 'Enter address',
  ENTER_COLLEGE: 'Enter college name',
  ENTER_AMOUNT: 'Enter amount',
  ENTER_MESSAGE: 'Enter your message',
  SELECT_OPTION: 'Select an option',
  CHOOSE_FILE: 'Choose file',
  NO_FILE_CHOSEN: 'No file chosen',
} as const;

// Help Messages
export const HELP_MESSAGES = {
  PASSWORD_REQUIREMENTS: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  PHOTO_REQUIREMENTS: 'Photo must be in JPG, PNG, or WebP format and less than 5MB.',
  PAYMENT_HELP: 'Payments are processed securely. You will receive a confirmation email once the payment is completed.',
  PRIVACY_HELP: 'Your personal information is protected and will not be shared with third parties without your consent.',
} as const; 