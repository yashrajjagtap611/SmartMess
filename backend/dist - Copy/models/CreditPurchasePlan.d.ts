import mongoose, { Document } from 'mongoose';
export interface ICreditPurchasePlan extends Document {
    name: string;
    description: string;
    baseCredits: number;
    bonusCredits: number;
    totalCredits: number;
    price: number;
    currency: string;
    isActive: boolean;
    isPopular: boolean;
    features: string[];
    validityDays?: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
}
declare const _default: mongoose.Model<ICreditPurchasePlan, {}, {}, {}, mongoose.Document<unknown, {}, ICreditPurchasePlan> & ICreditPurchasePlan & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=CreditPurchasePlan.d.ts.map