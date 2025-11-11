import mongoose, { Document } from 'mongoose';
export interface IPollOption {
    id: string;
    text: string;
    votes: number;
    voters: mongoose.Types.ObjectId[];
}
export interface IPoll extends Document {
    question: string;
    options: IPollOption[];
    roomId: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    isActive: boolean;
    expiresAt?: Date;
    totalVotes: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Poll: mongoose.Model<IPoll, {}, {}, {}, mongoose.Document<unknown, {}, IPoll> & IPoll & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Poll.d.ts.map