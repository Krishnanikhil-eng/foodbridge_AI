export type HeightUnit = "cm" | "ft_in";

export type NutritionAssessmentData = {
  // Step 1: Personal Details
  gender: string;
  age: string;
  heightUnit: HeightUnit;
  heightCm: string;
  heightFeet: string;
  heightInches: string;
  weightKg: string;
  targetWeightKg: string;

  // Step 2: Fitness Goals & Activity
  primaryGoal: string;
  activityLevel: string;
  weeklyWorkoutDays: string;

  // Step 3: Food Preferences & Allergies
  dietaryPreferences: string[];
  allergies: string[];
  dislikedFoods: string;

  // Step 4: Health Requirements
  healthConditions: string[];
  medicationsNotes: string;
  waterIntakeGoalLiters: string;

  // Step 5: Meal Preferences & Budget
  mealsPerDay: string;
  cookingTimeAvailable: string;
  weeklyGroceryBudget: string;
  preferredCuisines: string[];
};

export const INITIAL_ASSESSMENT_DATA: NutritionAssessmentData = {
  gender: "",
  age: "",
  heightUnit: "cm",
  heightCm: "",
  heightFeet: "",
  heightInches: "",
  weightKg: "",
  targetWeightKg: "",
  primaryGoal: "",
  activityLevel: "",
  weeklyWorkoutDays: "3",
  dietaryPreferences: [],
  allergies: [],
  dislikedFoods: "",
  healthConditions: [],
  medicationsNotes: "",
  waterIntakeGoalLiters: "2.5",
  mealsPerDay: "3",
  cookingTimeAvailable: "30_mins",
  weeklyGroceryBudget: "moderate",
  preferredCuisines: [],
};

export const FITNESS_GOALS = [
  { id: "weight_loss", title: "Weight Loss", desc: "Burn fat & maintain lean muscle" },
  { id: "muscle_gain", title: "Muscle Hypertrophy", desc: "High protein mass building" },
  { id: "maintenance", title: "Maintenance & Vitality", desc: "Balanced energy & overall wellness" },
  { id: "athletic_perf", title: "Athletic Endurance", desc: "Optimize stamina and performance" },
];

export const ACTIVITY_LEVELS = [
  { id: "sedentary", title: "Sedentary", desc: "Desk job, little to no exercise" },
  { id: "lightly_active", title: "Lightly Active", desc: "Light exercise 1-3 days/week" },
  { id: "moderately_active", title: "Moderately Active", desc: "Moderate exercise 3-5 days/week" },
  { id: "very_active", title: "Very Active", desc: "Hard exercise 6-7 days/week" },
];

export const DIETARY_OPTIONS = [
  "Non-Vegetarian",
  "Vegetarian",
  "Eggetarian",
  "Vegan",
  "Pescatarian",
  "Omnivore",
  "Keto",
  "Low Carb",
  "Mediterranean",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Dairy-Free",
];

export const ALLERGY_OPTIONS = [
  "Peanuts",
  "Tree Nuts",
  "Dairy / Lactose",
  "Eggs",
  "Wheat / Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
];

export const HEALTH_CONDITION_OPTIONS = [
  "None",
  "Pre-Diabetes / Diabetes",
  "High Blood Pressure",
  "High Cholesterol",
  "PCOS / Hormonal",
  "Acid Reflux / GERD",
  "IBS / Sensitive Digestion",
];

export const CUISINE_OPTIONS = [
  "American",
  "Indian",
  "Mediterranean",
  "Italian",
  "Mexican",
  "East Asian",
  "Middle Eastern",
];
