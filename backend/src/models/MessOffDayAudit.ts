import mongoose, { Schema, Document } from 'mongoose';

export interface IMessOffDayAudit extends Document {
  messId: mongoose.Types.ObjectId;
  offDayId?: mongoose.Types.ObjectId; // may be absent after deletion
  action: 'create' | 'update' | 'delete';
  by: mongoose.Types.ObjectId;
  at: Date;
  changes?: Record<string, any>;
  snapshot?: Record<string, any>;
  note?: string;
}

const MessOffDayAuditSchema = new Schema<IMessOffDayAudit>({
  messId: { type: Schema.Types.ObjectId, ref: 'MessProfile', index: true, required: true },
  offDayId: { type: Schema.Types.ObjectId, ref: 'MessOffDay', index: true },
  action: { type: String, enum: ['create', 'update', 'delete'], required: true, index: true },
  by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  at: { type: Date, default: Date.now, index: true },
  changes: { type: Schema.Types.Mixed },
  snapshot: { type: Schema.Types.Mixed },
  note: { type: String, maxlength: 1000 }
});

const MessOffDayAudit = mongoose.model<IMessOffDayAudit>('MessOffDayAudit', MessOffDayAuditSchema);
export default MessOffDayAudit;


