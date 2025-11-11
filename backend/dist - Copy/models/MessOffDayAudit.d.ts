import mongoose, { Document } from 'mongoose';
export interface IMessOffDayAudit extends Document {
    messId: mongoose.Types.ObjectId;
    offDayId?: mongoose.Types.ObjectId;
    action: 'create' | 'update' | 'delete';
    by: mongoose.Types.ObjectId;
    at: Date;
    changes?: Record<string, any>;
    snapshot?: Record<string, any>;
    note?: string;
}
declare const MessOffDayAudit: mongoose.Model<IMessOffDayAudit, {}, {}, {}, mongoose.Document<unknown, {}, IMessOffDayAudit> & IMessOffDayAudit & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default MessOffDayAudit;
//# sourceMappingURL=MessOffDayAudit.d.ts.map