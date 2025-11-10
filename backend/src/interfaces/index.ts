// Interfaces Barrel File
// This file exports all interfaces in an organized manner

// Core Interfaces
export * from './user.interface';
export * from './auth.interface';
export * from './mess.interface';

// Re-export commonly used interfaces
export { IUserProfile, IUserUpdate, IUserActivity, IUserAuthenticatedRequest } from './user.interface';
export { IAuthResponse, ILoginRequest, IRegisterRequest, IAuthenticatedRequest } from './auth.interface';
export { IMessProfile, ICreateMessProfileRequest, IUpdateMessProfileRequest, IMessResponse } from './mess.interface'; 