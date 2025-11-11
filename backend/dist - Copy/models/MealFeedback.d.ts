import mongoose, { Document } from 'mongoose';
export interface IMealFeedback extends Document {
    messId: string;
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    mealDate: Date;
    sentiment?: 'positive' | 'negative' | 'neutral';
    isResolved: boolean;
    responses?: Array<{
        userId: string;
        userName: string;
        comment: string;
        createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IMealFeedback, {}, {}, {}, mongoose.Document<unknown, {}, IMealFeedback> & IMealFeedback & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=MealFeedback.d.ts.map