import { Request } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

// Leave Request Types
export interface CreateLeaveRequestBody {
  mealPlanIds: string[];
  startDate: string;
  endDate: string;
  mealTypes: ('breakfast' | 'lunch' | 'dinner')[];
  startDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  endDateMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  middleDaysMealTypes?: ('breakfast' | 'lunch' | 'dinner')[];
  reason?: string;
  planWiseBreakdown?: Record<string, any>;
  totalDays?: number;
  totalMealsMissed?: number;
  estimatedSavings?: number;
  mealBreakdown?: Record<string, any>;
}

export interface ExtendLeaveRequestBody {
  newEndDate: string;
  reason?: string;
}

export interface LeaveRequestParams extends ParamsDictionary {
  id?: string;
}

export interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

export interface UpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateNotificationsBody {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
}

export interface UpdateEmailBody {
  email: string;
  password: string;
}

export interface GetProfileResponse {
  success: boolean;
  data: {
    firstName?: string;
    lastName?: string;
    email: string;
    phone?: string;
    avatar?: string | null;
    preferences?: Record<string, any>;
  };
}

export interface AvatarQuery {
  hash?: string;
}

export interface AvatarRequestFiles {
  avatar: Express.Multer.File;
}

export interface MembershipsQuery {
  status?: string;
  limit?: string;
  page?: string;
}

export interface NotificationsQuery {
  page?: string;
  limit?: string;
  type?: string;
}

export interface UpdatePreferencesBody {
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
  };
}

export interface UpdateDietaryPreferencesBody {
  dietary?: {
    vegetarian?: boolean;
    vegan?: boolean;
    glutenFree?: boolean;
    dairyFree?: boolean;
    nutFree?: boolean;
  };
}

export interface UpdateAllergiesBody {
  allergies?: string[];
}

export interface UpdateMealTimesBody {
  mealTimes?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
}

export interface LeaveRequestQuery extends ParsedQs {
  status?: string;
  limit?: string;
  page?: string;
}

// Request Type with User info
export type AuthenticatedRequest<
  Body = any,
  Params extends ParamsDictionary = ParamsDictionary,
  Query extends ParsedQs = ParsedQs
> = Request<Params, any, Body, Query> & {
  user: {
    id: string;
    role: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    messId?: string;
    isActive?: boolean;
    preferences?: any;
  };
  file?: {
    buffer: Buffer;
    originalname: string;
    path: string;
  };
}