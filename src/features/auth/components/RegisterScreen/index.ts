// Component
export { default, default as RegisterScreen } from './RegisterScreen';

// Types
export type {
  RegisterScreenProps,
  RegisterFormData,
  RegisterState,
  RegisterErrors
} from './RegisterScreen.types';

// Hooks
export { useRegisterScreen } from './RegisterScreen.hooks';

// Utils
export {
  validateEmail,
  validatePhone,
  validatePassword,
  validateRegisterForm,
  sanitizeFormData,
  getRegisterErrorMessage
} from './RegisterScreen.utils';

