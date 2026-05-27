import mongoose, { Schema, type Document, type Types } from "mongoose";

export const HEALTH_CONDITIONS = [
  "diabetes",
  "thyroid",
  "obesity",
  "hypertension",
  "heart_disease",
  "kidney_disease",
  "pregnancy",
  "general",
] as const;

export type HealthCondition = (typeof HEALTH_CONDITIONS)[number];

export interface IDietPlan extends Document {
  userId: Types.ObjectId;
  condition: HealthCondition;
  dailyCalorieTarget: number;
  meals: {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks?: string;
  }[];
  aiGenerated: boolean;
  language: string;
  notes?: string;
}

const dietPlanSchema = new Schema<IDietPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    condition: { type: String, enum: HEALTH_CONDITIONS, default: "general" },
    dailyCalorieTarget: { type: Number, required: true },
    meals: [
      {
        day: String,
        breakfast: String,
        lunch: String,
        dinner: String,
        snacks: String,
      },
    ],
    aiGenerated: { type: Boolean, default: true },
    language: { type: String, default: "en" },
    notes: String,
  },
  { timestamps: true }
);

export const DietPlan = mongoose.model<IDietPlan>("DietPlan", dietPlanSchema);

export interface INutritionLog extends Document {
  userId: Types.ObjectId;
  date: string;
  meals: { name: string; calories: number; time?: string }[];
  totalCalories: number;
  notes?: string;
}

const nutritionLogSchema = new Schema<INutritionLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    meals: [{ name: String, calories: Number, time: String }],
    totalCalories: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

nutritionLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export const NutritionLog = mongoose.model<INutritionLog>(
  "NutritionLog",
  nutritionLogSchema
);

export interface IBmiRecord extends Document {
  userId: Types.ObjectId;
  weightKg: number;
  heightCm: number;
  bmi: number;
  category: string;
}

const bmiRecordSchema = new Schema<IBmiRecord>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    weightKg: { type: Number, required: true },
    heightCm: { type: Number, required: true },
    bmi: { type: Number, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

export const BmiRecord = mongoose.model<IBmiRecord>("BmiRecord", bmiRecordSchema);

export interface IWaterTracking extends Document {
  userId: Types.ObjectId;
  date: string;
  glasses: number;
  targetGlasses: number;
  remindersEnabled: boolean;
}

const waterTrackingSchema = new Schema<IWaterTracking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    glasses: { type: Number, default: 0 },
    targetGlasses: { type: Number, default: 8 },
    remindersEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

waterTrackingSchema.index({ userId: 1, date: 1 }, { unique: true });

export const WaterTracking = mongoose.model<IWaterTracking>(
  "WaterTracking",
  waterTrackingSchema
);

export interface IFastingSession extends Document {
  userId: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  targetHours: number;
  status: "active" | "completed" | "cancelled";
}

const fastingSchema = new Schema<IFastingSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: Date,
    targetHours: { type: Number, default: 16 },
    status: { type: String, enum: ["active", "completed", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

export const FastingSession = mongoose.model<IFastingSession>(
  "FastingSession",
  fastingSchema
);
