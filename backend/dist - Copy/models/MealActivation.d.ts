import { Document, Types } from 'mongoose';
export interface IMealActivation extends Document {
    _id: Types.ObjectId;
    userId: string;
    messId: string;
    mealId: string;
    mealPlanId: string;
    mealType: 'breakfast' | 'lunch' | 'dinner';
    activationDate: Date;
    activationTime: Date;
    qrCode: string;
    scannedBy?: string;
    scannedAt?: Date;
    status: 'generated' | 'activated' | 'expired';
    expiresAt: Date;
    metadata?: {
        deviceInfo?: string;
        location?: string;
        scannerType?: 'user' | 'mess_owner';
    };
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IMealActivation, {}, {}, {}, Document<unknown, {}, IMealActivation> & IMealActivation & Required<{
    _id: Types.ObjectId;
}>, any>;
export default _default;
//# sourceMappingURL=MealActivation.d.ts.map