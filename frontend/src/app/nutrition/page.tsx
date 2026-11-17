"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  NutritionAssessmentData,
  INITIAL_ASSESSMENT_DATA,
  FITNESS_GOALS,
  ACTIVITY_LEVELS,
  DIETARY_OPTIONS,
  ALLERGY_OPTIONS,
  HEALTH_CONDITION_OPTIONS,
  CUISINE_OPTIONS,
  HeightUnit,
} from "./types";

const STEPS = [
  { id: 1, name: "Personal Details", short: "Details" },
  { id: 2, name: "Fitness Goals", short: "Goals" },
  { id: 3, name: "Food Preferences", short: "Food" },
  { id: 4, name: "Health Requirements", short: "Health" },
  { id: 5, name: "Meal & Budget", short: "Budget" },
];

export default function NutritionAssessmentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<NutritionAssessmentData>(INITIAL_ASSESSMENT_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load authenticated session and existing assessment from Supabase
  useEffect(() => {
    async function initUserAssessment() {
      setLoadingInitial(true);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        router.replace("/login");
        return;
      }

      const uid = session.user.id;
      setUserId(uid);

      // Check if user already submitted a nutrition assessment
      const { data, error } = await supabase
        .from("nutrition_assessments")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (data) {
        setFormData({
          gender: data.gender || "",
          age: data.age ? data.age.toString() : "",
          heightUnit: (data.height_unit as HeightUnit) || "cm",
          heightCm: data.height_cm ? data.height_cm.toString() : "",
          heightFeet: data.height_feet ? data.height_feet.toString() : "",
          heightInches: data.height_inches ? data.height_inches.toString() : "",
          weightKg: data.weight_kg ? data.weight_kg.toString() : "",
          targetWeightKg: data.target_weight_kg ? data.target_weight_kg.toString() : "",
          primaryGoal: data.primary_goal || "",
          activityLevel: data.activity_level || "",
          weeklyWorkoutDays: data.weekly_workout_days ? data.weekly_workout_days.toString() : "3",
          dietaryPreferences: data.dietary_preferences || [],
          allergies: data.allergies || [],
          dislikedFoods: data.disliked_foods || "",
          healthConditions: data.health_conditions || [],
          medicationsNotes: data.medications_notes || "",
          waterIntakeGoalLiters: data.water_intake_goal_liters ? data.water_intake_goal_liters.toString() : "2.5",
          mealsPerDay: data.meals_per_day || "3",
          cookingTimeAvailable: data.cooking_time_available || "30_mins",
          weeklyGroceryBudget: data.weekly_grocery_budget || "moderate",
          preferredCuisines: data.preferred_cuisines || [],
        });
      }

      setLoadingInitial(false);
    }

    initUserAssessment();
  }, [router]);

  const updateField = (field: keyof NutritionAssessmentData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleUnitToggle = (unit: HeightUnit) => {
    if (unit === formData.heightUnit) return;

    if (unit === "ft_in") {
      const cm = parseFloat(formData.heightCm);
      if (!isNaN(cm) && cm > 0) {
        const totalInches = cm / 2.54;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        setFormData((prev) => ({
          ...prev,
          heightUnit: "ft_in",
          heightFeet: feet.toString(),
          heightInches: inches.toString(),
        }));
      } else {
        setFormData((prev) => ({ ...prev, heightUnit: "ft_in" }));
      }
    } else {
      const feet = parseFloat(formData.heightFeet) || 0;
      const inches = parseFloat(formData.heightInches) || 0;
      if (feet > 0 || inches > 0) {
        const totalInches = feet * 12 + inches;
        const cm = Math.round(totalInches * 2.54);
        setFormData((prev) => ({
          ...prev,
          heightUnit: "cm",
          heightCm: cm.toString(),
        }));
      } else {
        setFormData((prev) => ({ ...prev, heightUnit: "cm" }));
      }
    }
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy.height;
      return copy;
    });
  };

  const getEffectiveHeightDisplay = (): string => {
    if (formData.heightUnit === "cm") {
      return formData.heightCm ? `${formData.heightCm} cm` : "N/A";
    } else {
      return formData.heightFeet
        ? `${formData.heightFeet} ft ${formData.heightInches || 0} in`
        : "N/A";
    }
  };

  const toggleArrayItem = (field: "dietaryPreferences" | "allergies" | "healthConditions" | "preferredCuisines", item: string) => {
    setFormData((prev) => {
      const list = prev[field];
      const nextList = list.includes(item)
        ? list.filter((x) => x !== item)
        : [...list, item];
      return { ...prev, [field]: nextList };
    });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.gender) newErrors.gender = "Please select your gender.";
      if (!formData.age || Number(formData.age) < 12 || Number(formData.age) > 120) {
        newErrors.age = "Please enter a valid age (12-120).";
      }

      if (formData.heightUnit === "cm") {
        if (!formData.heightCm || Number(formData.heightCm) < 80 || Number(formData.heightCm) > 260) {
          newErrors.height = "Please enter valid height in cm (80-260).";
        }
      } else {
        const ft = Number(formData.heightFeet);
        const inch = Number(formData.heightInches || 0);
        if (!formData.heightFeet || ft < 2 || ft > 8 || inch < 0 || inch >= 12) {
          newErrors.height = "Please enter valid feet (2-8) and inches (0-11).";
        }
      }

      if (!formData.weightKg || Number(formData.weightKg) < 25 || Number(formData.weightKg) > 300) {
        newErrors.weightKg = "Please enter weight in kg (25-300).";
      }
    } else if (step === 2) {
      if (!formData.primaryGoal) newErrors.primaryGoal = "Please choose a primary fitness goal.";
      if (!formData.activityLevel) newErrors.activityLevel = "Please choose your activity level.";
    } else if (step === 3) {
      if (formData.dietaryPreferences.length === 0) {
        newErrors.dietaryPreferences = "Select at least one dietary pattern (e.g. Non-Vegetarian, Vegetarian).";
      }
    } else if (step === 4) {
      if (!formData.waterIntakeGoalLiters) {
        newErrors.waterIntakeGoalLiters = "Please specify daily water goal.";
      }
    } else if (step === 5) {
      if (!formData.mealsPerDay) newErrors.mealsPerDay = "Please select meal frequency.";
      if (!formData.weeklyGroceryBudget) newErrors.weeklyGroceryBudget = "Please select a budget range.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAssessmentToSupabase = async () => {
    if (!userId) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        user_id: userId,
        gender: formData.gender,
        age: parseInt(formData.age, 10),
        height_unit: formData.heightUnit,
        height_cm: formData.heightCm ? parseFloat(formData.heightCm) : null,
        height_feet: formData.heightFeet ? parseInt(formData.heightFeet, 10) : null,
        height_inches: formData.heightInches ? parseInt(formData.heightInches, 10) : null,
        weight_kg: parseFloat(formData.weightKg),
        target_weight_kg: formData.targetWeightKg ? parseFloat(formData.targetWeightKg) : null,
        primary_goal: formData.primaryGoal,
        activity_level: formData.activityLevel,
        weekly_workout_days: parseInt(formData.weeklyWorkoutDays || "3", 10),
        dietary_preferences: formData.dietaryPreferences,
        allergies: formData.allergies,
        disliked_foods: formData.dislikedFoods.trim(),
        health_conditions: formData.healthConditions,
        medications_notes: formData.medicationsNotes.trim(),
        water_intake_goal_liters: parseFloat(formData.waterIntakeGoalLiters || "2.5"),
        meals_per_day: formData.mealsPerDay,
        cooking_time_available: formData.cookingTimeAvailable,
        weekly_grocery_budget: formData.weeklyGroceryBudget,
        preferred_cuisines: formData.preferredCuisines,
        updated_at: new Date().toISOString(),
      };

      // Upsert: prevents duplicates by updating the row if user_id already exists
      const { error: upsertError } = await supabase
        .from("nutrition_assessments")
        .upsert(payload, { onConflict: "user_id" });

      if (upsertError) {
        throw upsertError;
      }

      setIsCompleted(true);
      setStatusMessage({
        type: "success",
        text: "Nutrition assessment successfully saved to your profile!",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save assessment to Supabase.";
      setStatusMessage({ type: "error", text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep((prev) => prev + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        await saveAssessmentToSupabase();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-600">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          Loading your nutrition assessment...
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round((currentStep / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 bg-white px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">FoodBridge AI</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Nutrition Assessment
          </span>
        </div>

        <Link
          href="/"
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Exit Assessment
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl border text-xs font-medium flex items-center justify-between ${
              statusMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-xs opacity-60 hover:opacity-100 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Progress Bar & Stepper Indicator */}
        {!isCompleted && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              <span>Step {currentStep} of {STEPS.length}: {STEPS[currentStep - 1].name}</span>
              <span className="text-emerald-600">{progressPercentage}% Completed</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            {/* Step Breadcrumbs */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              {STEPS.map((s) => {
                const isActive = currentStep === s.id;
                const isPast = currentStep > s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (s.id < currentStep) setCurrentStep(s.id);
                    }}
                    disabled={s.id > currentStep}
                    className={`text-left p-2 rounded-lg border text-xs transition-colors ${
                      isActive
                        ? "border-emerald-600 bg-emerald-50/70 text-emerald-800 font-semibold shadow-xs"
                        : isPast
                        ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                        : "border-slate-200 bg-slate-100/60 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <div className="font-mono text-[10px] text-slate-400">0{s.id}</div>
                    <div className="truncate">{s.short}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Assessment Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {isCompleted ? (
            /* Submission Summary View */
            <div className="text-center py-8 space-y-6">
              <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl font-bold mx-auto shadow-sm">
                ✓
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Nutrition Assessment Saved</h2>
                <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                  Your baseline biometric parameters, dietary rules, and health goals are stored securely in Supabase.
                </p>
              </div>

              {/* Assessment Summary Snapshot */}
              <div className="border border-slate-200 rounded-xl bg-slate-50/80 p-5 text-left text-xs space-y-3 max-w-lg mx-auto">
                <div className="font-semibold text-slate-700 uppercase tracking-wider pb-2 border-b border-slate-200">
                  Profile Snapshot
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-600">
                  <div>Gender: <span className="font-medium text-slate-900">{formData.gender || "N/A"}</span></div>
                  <div>Age: <span className="font-medium text-slate-900">{formData.age} yrs</span></div>
                  <div>Height / Weight: <span className="font-medium text-slate-900">{getEffectiveHeightDisplay()} / {formData.weightKg}kg</span></div>
                  <div>Goal: <span className="font-medium text-slate-900 capitalize">{formData.primaryGoal.replace("_", " ")}</span></div>
                  <div>Diet: <span className="font-medium text-slate-900">{formData.dietaryPreferences.join(", ") || "None"}</span></div>
                  <div>Meals / Day: <span className="font-medium text-slate-900">{formData.mealsPerDay} meals</span></div>
                  <div>Budget: <span className="font-medium text-slate-900 capitalize">{formData.weeklyGroceryBudget}</span></div>
                  <div>Water Goal: <span className="font-medium text-slate-900">{formData.waterIntakeGoalLiters} L/day</span></div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCompleted(false);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Edit Answers
                </button>
                <Link
                  href="/"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors text-center"
                >
                  Return to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Step 1: Personal Details */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Personal Details</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Basic biometric metrics used to calculate basal metabolic rate (BMR) and daily calorie needs.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                        Biological Gender
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {["Male", "Female", "Other"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => updateField("gender", g)}
                            className={`py-2.5 rounded-lg text-xs font-semibold border transition-all ${
                              formData.gender === g
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                      {errors.gender && <p className="text-xs text-rose-600 mt-1">{errors.gender}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="age" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                          Age (years)
                        </label>
                        <input
                          id="age"
                          type="number"
                          placeholder="e.g. 28"
                          value={formData.age}
                          onChange={(e) => updateField("age", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.age && <p className="text-xs text-rose-600 mt-1">{errors.age}</p>}
                      </div>

                      {/* Height with cm / ft+in Toggle */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                            Height
                          </label>
                          <div className="inline-flex rounded-md border border-slate-200 p-0.5 bg-slate-100 text-[11px] font-semibold">
                            <button
                              type="button"
                              onClick={() => handleUnitToggle("cm")}
                              className={`px-2 py-0.5 rounded transition-colors ${
                                formData.heightUnit === "cm"
                                  ? "bg-white text-emerald-700 shadow-xs"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              cm
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUnitToggle("ft_in")}
                              className={`px-2 py-0.5 rounded transition-colors ${
                                formData.heightUnit === "ft_in"
                                  ? "bg-white text-emerald-700 shadow-xs"
                                  : "text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              ft / in
                            </button>
                          </div>
                        </div>

                        {formData.heightUnit === "cm" ? (
                          <div className="relative">
                            <input
                              id="heightCm"
                              type="number"
                              placeholder="e.g. 175"
                              value={formData.heightCm}
                              onChange={(e) => updateField("heightCm", e.target.value)}
                              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-12"
                            />
                            <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                              cm
                            </span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <input
                                id="heightFeet"
                                type="number"
                                placeholder="5"
                                min="2"
                                max="8"
                                value={formData.heightFeet}
                                onChange={(e) => updateField("heightFeet", e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                              />
                              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                                ft
                              </span>
                            </div>
                            <div className="relative">
                              <input
                                id="heightInches"
                                type="number"
                                placeholder="9"
                                min="0"
                                max="11"
                                value={formData.heightInches}
                                onChange={(e) => updateField("heightInches", e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-10"
                              />
                              <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                                in
                              </span>
                            </div>
                          </div>
                        )}

                        {errors.height && <p className="text-xs text-rose-600 mt-1">{errors.height}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="weightKg" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                          Current Weight (kg)
                        </label>
                        <input
                          id="weightKg"
                          type="number"
                          step="0.1"
                          placeholder="e.g. 74.5"
                          value={formData.weightKg}
                          onChange={(e) => updateField("weightKg", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.weightKg && <p className="text-xs text-rose-600 mt-1">{errors.weightKg}</p>}
                      </div>

                      <div>
                        <label htmlFor="targetWeightKg" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                          Target Weight (kg) <span className="text-slate-400 font-normal lowercase">(optional)</span>
                        </label>
                        <input
                          id="targetWeightKg"
                          type="number"
                          step="0.1"
                          placeholder="e.g. 70"
                          value={formData.targetWeightKg}
                          onChange={(e) => updateField("targetWeightKg", e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Fitness Goals & Activity */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Fitness Goals & Activity</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose your primary physiological target and current lifestyle activity level.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      Primary Objective
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {FITNESS_GOALS.map((goal) => {
                        const isSelected = formData.primaryGoal === goal.id;
                        return (
                          <div
                            key={goal.id}
                            onClick={() => updateField("primaryGoal", goal.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-50/80 shadow-xs"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-900">{goal.title}</span>
                              <span
                                className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${
                                  isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                                }`}
                              >
                                {isSelected ? "✓" : ""}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{goal.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                    {errors.primaryGoal && <p className="text-xs text-rose-600 mt-1">{errors.primaryGoal}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      Lifestyle Activity Level
                    </label>
                    <div className="space-y-2">
                      {ACTIVITY_LEVELS.map((act) => {
                        const isSelected = formData.activityLevel === act.id;
                        return (
                          <div
                            key={act.id}
                            onClick={() => updateField("activityLevel", act.id)}
                            className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-all ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-50/80 shadow-xs"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900">{act.title}</div>
                              <div className="text-[11px] text-slate-500">{act.desc}</div>
                            </div>
                            <span
                              className={`h-4 w-4 rounded-full border flex items-center justify-center text-[10px] ${
                                isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300"
                              }`}
                            >
                              {isSelected ? "✓" : ""}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {errors.activityLevel && <p className="text-xs text-rose-600 mt-1">{errors.activityLevel}</p>}
                  </div>
                </div>
              )}

              {/* Step 3: Food Preferences & Allergies */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Food Preferences & Allergies</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Configure restrictions and allergens to filter recipe recommendations and grocery lists.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Dietary Pattern (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {DIETARY_OPTIONS.map((opt) => {
                        const isSelected = formData.dietaryPreferences.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleArrayItem("dietaryPreferences", opt)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {errors.dietaryPreferences && (
                      <p className="text-xs text-rose-600 mt-1">{errors.dietaryPreferences}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Allergies & Intolerances
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {ALLERGY_OPTIONS.map((allergy) => {
                        const isSelected = formData.allergies.includes(allergy);
                        return (
                          <button
                            key={allergy}
                            type="button"
                            onClick={() => toggleArrayItem("allergies", allergy)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              isSelected
                                ? "bg-rose-600 border-rose-600 text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {isSelected ? "✕ " : "+ "}
                            {allergy}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dislikedFoods" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Disliked Foods or Ingredients
                    </label>
                    <input
                      id="dislikedFoods"
                      type="text"
                      placeholder="e.g. Cilantro, Mushrooms, Bell peppers"
                      value={formData.dislikedFoods}
                      onChange={(e) => updateField("dislikedFoods", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 4: Health Requirements */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Health Requirements</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Medical considerations to tailor sodium, sugar, and micronutrient calculations.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Health Conditions or Nutritional Goals
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {HEALTH_CONDITION_OPTIONS.map((cond) => {
                        const isSelected = formData.healthConditions.includes(cond);
                        return (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => toggleArrayItem("healthConditions", cond)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {cond}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Daily Water Intake Target (Liters)
                    </label>
                    <div className="flex items-center gap-3">
                      {["2.0", "2.5", "3.0", "3.5+"].map((liters) => (
                        <button
                          key={liters}
                          type="button"
                          onClick={() => updateField("waterIntakeGoalLiters", liters)}
                          className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                            formData.waterIntakeGoalLiters === liters
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {liters} L
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="medNotes" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Doctor or Medication Notes
                    </label>
                    <textarea
                      id="medNotes"
                      rows={3}
                      placeholder="e.g. Need low potassium due to medication, doctor recommended increased magnesium."
                      value={formData.medicationsNotes}
                      onChange={(e) => updateField("medicationsNotes", e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* Step 5: Meal Preferences & Budget */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Meal Preferences & Budget</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Define planning constraints for realistic recipes, meal cadence, and price comparison.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                        Meals Per Day
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {["2", "3", "4+"].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => updateField("mealsPerDay", m)}
                            className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                              formData.mealsPerDay === m
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {m} meals
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                        Max Cooking Time / Meal
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: "15_mins", label: "15 min" },
                          { id: "30_mins", label: "30 min" },
                          { id: "45+_mins", label: "45+ min" },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => updateField("cookingTimeAvailable", t.id)}
                            className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                              formData.cookingTimeAvailable === t.id
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      Weekly Grocery Budget Category
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: "budget", label: "Budget-Friendly", desc: "Low cost staples" },
                        { id: "moderate", label: "Moderate", desc: "Balanced organic/staple" },
                        { id: "premium", label: "Flexible / Premium", desc: "Specialty ingredients" },
                      ].map((b) => (
                        <div
                          key={b.id}
                          onClick={() => updateField("weeklyGroceryBudget", b.id)}
                          className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                            formData.weeklyGroceryBudget === b.id
                              ? "border-emerald-600 bg-emerald-50/80 shadow-xs"
                              : "border-slate-200 bg-white hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-xs font-bold text-slate-900">{b.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{b.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                      Preferred Cuisines
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {CUISINE_OPTIONS.map((c) => {
                        const isSelected = formData.preferredCuisines.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleArrayItem("preferredCuisines", c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              isSelected
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {isSelected ? "✓ " : "+ "}
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving to Supabase...
                    </>
                  ) : currentStep === 5 ? (
                    "Complete & Save Assessment ✓"
                  ) : (
                    "Continue →"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
