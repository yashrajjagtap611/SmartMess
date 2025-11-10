// User Controllers Barrel File
// This file exports all user-related controllers

export { default as UserController } from '../userController';

// Export specific user controller methods
export const userControllers = {
  profile: {
    get: 'getProfile',
    update: 'updateProfile',
    delete: 'deleteProfile'
  },
  settings: {
    get: 'getSettings',
    update: 'updateSettings'
  },
  preferences: {
    get: 'getPreferences',
    update: 'updatePreferences'
  },
  activity: {
    get: 'getActivity',
    memberships: 'getMemberships',
    notifications: 'getNotifications'
  }
}; 