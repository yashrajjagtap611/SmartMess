import mongoose, { Document } from 'mongoose';
export interface IAdCredit extends Document {
    messId: mongoose.Types.ObjectId;
    totalCredits: number;
    usedCredits: number;
    availableCredits: number;
    createdAt: Date;
    updatedAt: Date;
    addCredits(amount: number): Promise<void>;
    deductCredits(amount: number): Promise<void>;
}
declare const _default: mongoose.Model<IAdCredit, {}, {}, {}, mongoose.Document<unknown, {}, IAdCredit> & IAdCredit & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=AdCredit.d.ts.map