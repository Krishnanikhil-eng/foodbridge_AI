export type UserProfile = {
  id: string;
  full_name: string;
  age: number | null;
  dietary_preferences: string[];
  allergies: string[];
  health_requirements: string;
  created_at?: string;
  updated_at?: string;
};

export const COMMON_DIETARY_PREFERENCES = [
  "Non-Vegetarian",
  "Vegetarian",
  "Eggetarian",
  "Vegan",
  "Pescatarian",
  "Omnivore",
  "Keto",
  "Paleo",
  "Low Carb",
  "Halal",
  "Kosher",
  "Gluten-Free",
  "Dairy-Free",
];

export const COMMON_ALLERGIES = [
  "Peanuts",
  "Tree Nuts",
  "Milk / Lactose",
  "Eggs",
  "Wheat / Gluten",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
];
