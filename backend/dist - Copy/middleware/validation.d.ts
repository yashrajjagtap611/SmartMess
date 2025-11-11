import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const commonSchemas: {
    id: Joi.StringSchema<string>;
    email: Joi.StringSchema<string>;
    password: Joi.StringSchema<string>;
    phone: Joi.StringSchema<string>;
    name: Joi.StringSchema<string>;
    role: Joi.StringSchema<string>;
    pagination: {
        page: Joi.NumberSchema<number>;
        limit: Joi.NumberSchema<number>;
        sortBy: Joi.StringSchema<string>;
        sortOrder: Joi.StringSchema<string>;
    };
};
export declare const authSchemas: {
    register: Joi.ObjectSchema<any>;
    login: Joi.ObjectSchema<any>;
    sendOtp: Joi.ObjectSchema<any>;
    verifyOtp: Joi.ObjectSchema<any>;
    resetPassword: Joi.ObjectSchema<any>;
};
export declare const userSchemas: {
    updateProfile: Joi.ObjectSchema<any>;
    changePassword: Joi.ObjectSchema<any>;
};
export declare const messProfileSchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const mealPlanSchemas: {
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const validate: (schema: Joi.ObjectSchema, location?: "body" | "query" | "params") => (req: Request, _res: Response, next: NextFunction) => void;
export declare const schemas: {
    common: {
        id: Joi.StringSchema<string>;
        email: Joi.StringSchema<string>;
        password: Joi.StringSchema<string>;
        phone: Joi.StringSchema<string>;
        name: Joi.StringSchema<string>;
        role: Joi.StringSchema<string>;
        pagination: {
            page: Joi.NumberSchema<number>;
            limit: Joi.NumberSchema<number>;
            sortBy: Joi.StringSchema<string>;
            sortOrder: Joi.StringSchema<string>;
        };
    };
    auth: {
        register: Joi.ObjectSchema<any>;
        login: Joi.ObjectSchema<any>;
        sendOtp: Joi.ObjectSchema<any>;
        verifyOtp: Joi.ObjectSchema<any>;
        resetPassword: Joi.ObjectSchema<any>;
    };
    user: {
        updateProfile: Joi.ObjectSchema<any>;
        changePassword: Joi.ObjectSchema<any>;
    };
    messProfile: {
        create: Joi.ObjectSchema<any>;
        update: Joi.ObjectSchema<any>;
    };
    mealPlan: {
        create: Joi.ObjectSchema<any>;
        update: Joi.ObjectSchema<any>;
    };
};
declare const _default: {
    validate: (schema: Joi.ObjectSchema, location?: "body" | "query" | "params") => (req: Request, _res: Response, next: NextFunction) => void;
    schemas: {
        common: {
            id: Joi.StringSchema<string>;
            email: Joi.StringSchema<string>;
            password: Joi.StringSchema<string>;
            phone: Joi.StringSchema<string>;
            name: Joi.StringSchema<string>;
            role: Joi.StringSchema<string>;
            pagination: {
                page: Joi.NumberSchema<number>;
                limit: Joi.NumberSchema<number>;
                sortBy: Joi.StringSchema<string>;
                sortOrder: Joi.StringSchema<string>;
            };
        };
        auth: {
            register: Joi.ObjectSchema<any>;
            login: Joi.ObjectSchema<any>;
            sendOtp: Joi.ObjectSchema<any>;
            verifyOtp: Joi.ObjectSchema<any>;
            resetPassword: Joi.ObjectSchema<any>;
        };
        user: {
            updateProfile: Joi.ObjectSchema<any>;
            changePassword: Joi.ObjectSchema<any>;
        };
        messProfile: {
            create: Joi.ObjectSchema<any>;
            update: Joi.ObjectSchema<any>;
        };
        mealPlan: {
            create: Joi.ObjectSchema<any>;
            update: Joi.ObjectSchema<any>;
        };
    };
    commonSchemas: {
        id: Joi.StringSchema<string>;
        email: Joi.StringSchema<string>;
        password: Joi.StringSchema<string>;
        phone: Joi.StringSchema<string>;
        name: Joi.StringSchema<string>;
        role: Joi.StringSchema<string>;
        pagination: {
            page: Joi.NumberSchema<number>;
            limit: Joi.NumberSchema<number>;
            sortBy: Joi.StringSchema<string>;
            sortOrder: Joi.StringSchema<string>;
        };
    };
    authSchemas: {
        register: Joi.ObjectSchema<any>;
        login: Joi.ObjectSchema<any>;
        sendOtp: Joi.ObjectSchema<any>;
        verifyOtp: Joi.ObjectSchema<any>;
        resetPassword: Joi.ObjectSchema<any>;
    };
    userSchemas: {
        updateProfile: Joi.ObjectSchema<any>;
        changePassword: Joi.ObjectSchema<any>;
    };
    messProfileSchemas: {
        create: Joi.ObjectSchema<any>;
        update: Joi.ObjectSchema<any>;
    };
    mealPlanSchemas: {
        create: Joi.ObjectSchema<any>;
        update: Joi.ObjectSchema<any>;
    };
};
export default _default;
//# sourceMappingURL=validation.d.ts.map