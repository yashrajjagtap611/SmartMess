import mongoose, { Document } from 'mongoose';
export interface IOperatingHour {
    meal: string;
    enabled: boolean;
    start: string;
    end: string;
}
export interface IOperatingHours extends Document {
    userId: mongoose.Types.ObjectId;
    operatingHours: IOperatingHour[];
    createdAt: Date;
    updatedAt: Date;
}
declare const OperatingHours: mongoose.Model<IOperatingHours, {}, {}, {}, mongoose.Document<unknown, {}, IOperatingHours> & IOperatingHours & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default OperatingHours;
//# sourceMappingURL=OperatingHours.d.ts.map