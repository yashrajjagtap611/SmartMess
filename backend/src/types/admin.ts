// Admin Types and Interfaces
// This file contains all admin-related type definitions

export interface IAdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'super-admin';
  isActive: boolean;
  lastLogin?: Date;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminDashboard {
  overview: {
    totalUsers: number;
    totalMesses: number;
    totalMemberships: number;
    activeMemberships: number;
  };
  userStats: {
    verified: number;
    unverified: number;
    admins: number;
    suspended: number;
    verificationRate: number;
  };
  messStats: {
    active: number;
    inactive: number;
    activeRate: number;
  };
  membershipStats: {
    active: number;
    pending: number;
    inactive: number;
    activeRate: number;
  };
  recentActivity: {
    newUsersLastWeek: number;
    newMessesLastWeek: number;
  };
  timestamp: string;
}

export interface IUserAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  registrations: Array<{
    _id: string;
    count: number;
  }>;
  roleDistribution: Array<{
    _id: string;
    count: number;
  }>;
  verificationStatus: Array<{
    _id: boolean;
    count: number;
  }>;
  totalUsers: number;
  newUsersInPeriod: number;
}

export interface IMessAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  creations: Array<{
    _id: string;
    count: number;
  }>;
  statusDistribution: Array<{
    _id: boolean;
    count: number;
  }>;
  locationDistribution: Array<{
    _id: string;
    count: number;
  }>;
  totalMesses: number;
  newMessesInPeriod: number;
}

export interface IMembershipAnalytics {
  period: string;
  startDate: string;
  endDate: string;
  creations: Array<{
    _id: string;
    count: number;
  }>;
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  paymentStatusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  totalMemberships: number;
  newMembershipsInPeriod: number;
}

export interface IFinancialAnalytics {
  summary: {
    totalPayments: number;
    totalAmount: number;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    successRate: number;
  };
  paymentStatusDistribution: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  monthlyTrends: Array<{
    _id: string;
    count: number;
    totalAmount: number;
  }>;
  data: any[];
  generatedAt: string;
}

export interface ITrendAnalytics {
  metric: string;
  period: string;
  startDate: string;
  endDate: string;
  data: Array<{
    _id: string;
    count: number;
  }>;
  total: number;
}

export interface IUserReport {
  summary: {
    total: number;
    verified: number;
    unverified: number;
    admins: number;
    regular: number;
    suspended: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: any[];
  generatedAt: string;
}

export interface IMessReport {
  summary: {
    total: number;
    active: number;
    inactive: number;
    withLogo: number;
    withoutLogo: number;
  };
  locationDistribution: Array<{
    _id: string;
    count: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: any[];
  generatedAt: string;
}

export interface IMembershipReport {
  summary: {
    total: number;
    active: number;
    pendingMemberships: number;
    inactive: number;
    paid: number;
    pendingPayments: number;
    overdue: number;
  };
  statusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  paymentStatusDistribution: Array<{
    _id: string;
    count: number;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  data: any[];
  generatedAt: string;
}

export interface ISystemSettings {
  systemInfo: {
    nodeVersion: string;
    platform: string;
    arch: string;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: NodeJS.CpuUsage;
    environment: string;
    timestamp: string;
  };
  applicationStats: {
    totalUsers: number;
    verifiedUsers: number;
    adminUsers: number;
    verificationRate: number;
  };
  features: {
    userRegistration: boolean;
    emailVerification: boolean;
    adminPanel: boolean;
    analytics: boolean;
    reporting: boolean;
    fileUploads: boolean;
  };
  limits: {
    maxFileSize: string;
    maxUsersPerMess: number;
    maxMessesPerUser: number;
    otpExpiryMinutes: number;
    jwtExpiryHours: number;
  };
}

export interface ISecuritySettings {
  authentication: {
    jwtSecret: string;
    jwtExpiry: string;
    refreshTokenExpiry: string;
    otpExpiry: string;
    maxLoginAttempts: number;
    lockoutDuration: string;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxAge: string;
  };
  rateLimiting: {
    general: {
      windowMs: string;
      maxRequests: number;
    };
    auth: {
      windowMs: string;
      maxRequests: number;
    };
    api: {
      windowMs: string;
      maxRequests: number;
    };
  };
  cors: {
    allowedOrigins: string[];
    credentials: boolean;
    methods: string[];
  };
  headers: {
    helmet: boolean;
    hsts: boolean;
    contentSecurityPolicy: boolean;
    xssProtection: boolean;
  };
}

export interface IEmailSettings {
  provider: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };
  templates: {
    welcome: boolean;
    verification: boolean;
    passwordReset: boolean;
    membershipInvite: boolean;
    paymentReminder: boolean;
  };
  defaults: {
    from: string;
    replyTo: string;
  };
  rateLimiting: {
    maxEmailsPerHour: number;
    maxEmailsPerDay: number;
  };
}

export interface INotificationSettings {
  push: {
    enabled: boolean;
    vapidPublicKey: string;
    vapidPrivateKey: string;
  };
  email: {
    enabled: boolean;
    welcome: boolean;
    verification: boolean;
    passwordReset: boolean;
    membershipUpdates: boolean;
    paymentReminders: boolean;
    systemAnnouncements: boolean;
  };
  sms: {
    enabled: boolean;
    provider: string;
    accountSid: string;
    authToken: string;
  };
  inApp: {
    enabled: boolean;
    membershipUpdates: boolean;
    paymentReminders: boolean;
    systemAnnouncements: boolean;
    promotionalOffers: boolean;
  };
  preferences: {
    defaultLanguage: string;
    timezone: string;
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  };
}

export interface IBackupInfo {
  type: string;
  filename: string;
  size: string;
  createdAt: string;
  createdBy: string;
  status: string;
}

export interface IAdminAction {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export interface IAdminPermission {
  id: string;
  name: string;
  description: string;
  resource: string;
  actions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  metadata?: any;
}

export interface IAdminNotification {
  id: string;
  adminId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  readAt?: Date;
  metadata?: any;
}

export interface IAdminDashboardWidget {
  id: string;
  name: string;
  type: 'chart' | 'metric' | 'table' | 'list';
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config: any;
  isVisible: boolean;
  refreshInterval: number;
  lastUpdated: Date;
}

export interface IAdminDashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: IAdminDashboardWidget[];
  isDefault: boolean;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
} 