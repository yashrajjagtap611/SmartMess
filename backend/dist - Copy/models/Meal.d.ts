import { Document, Types } from 'mongoose';
export interface IMeal extends Document {
    _id: Types.ObjectId;
    messId: string;
    name: string;
    description?: string;
    type: 'breakfast' | 'lunch' | 'dinner';
    category: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | 'eggetarian';
    categories: ('vegetarian' | 'non-vegetarian' | 'vegan' | 'jain' | 'eggetarian')[];
    date: Date;
    isAvailable: boolean;
    price: number;
    imageUrl?: string;
    tags: Array<{
        id: string;
        name: string;
        color: string;
    }>;
    associatedMealPlans: string[];
    nutritionalInfo?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        fiber?: number;
    };
    allergens?: string[];
    preparationTime?: number;
    servingSize?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: import("mongoose").Model<IMeal, {}, {}, {}, Document<unknown, {}, IMeal> & IMeal & Required<{
    _id: Types.ObjectId;
}>, any>;
export default _default;
//# sourceMappingURL=Meal.d.ts.map