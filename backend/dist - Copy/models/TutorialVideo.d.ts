import mongoose, { Document } from 'mongoose';
export interface ITutorialVideo extends Document {
    title: string;
    description?: string;
    videoUrl: string;
    category: 'user' | 'mess-owner' | 'general';
    order: number;
    thumbnailUrl?: string;
    duration?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}
declare const _default: mongoose.Model<ITutorialVideo, {}, {}, {}, mongoose.Document<unknown, {}, ITutorialVideo> & ITutorialVideo & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=TutorialVideo.d.ts.map