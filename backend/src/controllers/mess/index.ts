// Mess Controllers Barrel File
// This file exports all mess-related controllers

export { default as MessController } from '../messController';

// Export specific mess controller methods
export const messControllers = {
  profile: {
    get: 'getProfile',
    update: 'updateProfile',
    create: 'createProfile'
  },
  membership: {
    get: 'getMemberships',
    create: 'createMembership',
    update: 'updateMembership',
    delete: 'deleteMembership'
  },
  user: {
    get: 'getUsers',
    add: 'addUser',
    remove: 'removeUser',
    update: 'updateUser'
  },
  search: {
    search: 'searchMesses',
    filter: 'filterMesses'
  }
}; 