export const HEALTH_CONDITIONS = [
  { value: "diabetes", label: "Diabetes" },
  { value: "thyroid", label: "Thyroid" },
  { value: "obesity", label: "Obesity" },
  { value: "hypertension", label: "Hypertension" },
  { value: "heart_disease", label: "Heart Disease" },
  { value: "kidney_disease", label: "Kidney Disease" },
  { value: "pregnancy", label: "Pregnancy Nutrition" },
  { value: "general", label: "General Wellness" },
] as const;

export interface NutritionDashboard {
  plan: DietPlan | null;
  todayLog: NutritionLog | null;
  water: { glasses: number; targetGlasses: number; date: string };
  bmi: BmiRecord | null;
  activeFast: FastingSession | null;
  weeklyCalories: { date: string; calories: number; target: number }[];
}

export interface DietPlan {
  _id: string;
  condition: string;
  dailyCalorieTarget: number;
  meals: {
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
    snacks?: string;
  }[];
  language: string;
  createdAt: string;
}

export interface NutritionLog {
  _id: string;
  date: string;
  meals: { name: string; calories: number; time?: string }[];
  totalCalories: number;
}

export interface BmiRecord {
  _id: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  category: string;
  createdAt: string;
}

export interface FastingSession {
  _id: string;
  startTime: string;
  endTime?: string;
  targetHours: number;
  status: string;
}
