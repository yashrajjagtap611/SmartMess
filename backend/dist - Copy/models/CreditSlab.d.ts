import mongoose, { Document } from 'mongoose';
export interface ICreditSlab extends Document {
    minUsers: number;
    maxUsers: number;
    creditsPerUser: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: mongoose.Types.ObjectId;
    updatedBy: mongoose.Types.ObjectId;
}
export interface ICreditSlabModel extends mongoose.Model<ICreditSlab> {
    findApplicableSlab(userCount: number): Promise<ICreditSlab | null>;
    calculateCredits(userCount: number): Promise<number>;
}
declare const _default: ICreditSlabModel;
export default _default;
//# sourceMappingURL=CreditSlab.d.ts.map