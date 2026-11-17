"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  UserProfile,
  COMMON_DIETARY_PREFERENCES,
  COMMON_ALLERGIES,
} from "@/lib/profileTypes";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    full_name: "",
    age: null,
    dietary_preferences: [],
    allergies: [],
    health_requirements: "",
  });

  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    async function loadUserProfile() {
      setLoading(true);
      setMessage(null);

      // Check authenticated user
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        router.push("/login");
        return;
      }

      const user = session.user;
      setUserEmail(user.email || "");

      // Retrieve profile from Supabase PostgreSQL
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
        setMessage({ type: "error", text: error.message });
      }

      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || user.user_metadata?.full_name || "",
          age: data.age ?? null,
          dietary_preferences: data.dietary_preferences || [],
          allergies: data.allergies || [],
          health_requirements: data.health_requirements || "",
        });
      } else {
        // Fallback initialized profile for first-time profile creation
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || "",
          age: null,
          dietary_preferences: [],
          allergies: [],
          health_requirements: "",
        });
      }

      setLoading(false);
    }

    loadUserProfile();
  }, [router]);

  const togglePreference = (item: string) => {
    setProfile((prev) => {
      const exists = prev.dietary_preferences.includes(item);
      const updated = exists
        ? prev.dietary_preferences.filter((p) => p !== item)
        : [...prev.dietary_preferences, item];
      return { ...prev, dietary_preferences: updated };
    });
    setMessage(null);
  };

  const toggleAllergy = (item: string) => {
    setProfile((prev) => {
      const exists = prev.allergies.includes(item);
      const updated = exists
        ? prev.allergies.filter((a) => a !== item)
        : [...prev.allergies, item];
      return { ...prev, allergies: updated };
    });
    setMessage(null);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile.id) return;

    setSaving(true);
    setMessage(null);

    try {
      const ageVal = profile.age !== null && !isNaN(Number(profile.age)) ? Number(profile.age) : null;

      const payload = {
        id: profile.id,
        full_name: profile.full_name.trim(),
        age: ageVal,
        dietary_preferences: profile.dietary_preferences,
        allergies: profile.allergies,
        health_requirements: profile.health_requirements.trim(),
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" });

      if (upsertError) {
        throw upsertError;
      }

      // Also sync user metadata full_name if updated
      await supabase.auth.updateUser({
        data: { full_name: profile.full_name.trim() },
      });

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update profile.";
      setMessage({ type: "error", text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <span className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">FoodBridge AI</span>
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-sm font-semibold text-slate-600">User Profile</span>
        </div>

        <Link
          href="/"
          className="px-3 py-1.5 rounded-md text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          Back to Dashboard
        </Link>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Profile & Health Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalize your nutrition parameters, allergies, and health requirements.
          </p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border text-sm font-medium ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-900 border-b border-slate-100 pb-3">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  required
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  min="0"
                  max="130"
                  value={profile.age ?? ""}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      age: e.target.value ? parseInt(e.target.value, 10) : null,
                    }))
                  }
                  placeholder="e.g. 28"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Account Email
              </label>
              <input
                type="text"
                disabled
                value={userEmail}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-500 font-mono cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Associated with your authenticated Supabase ID ({profile.id ? profile.id.slice(0, 8) + "..." : ""}).
              </p>
            </div>
          </div>

          {/* Dietary Preferences Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Dietary Preferences
              </h2>
              <p className="text-xs text-slate-500">
                Select dietary patterns for smart food suggestions and meal planning.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {COMMON_DIETARY_PREFERENCES.map((pref) => {
                const isSelected = profile.dietary_preferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePreference(pref)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Allergies & Intolerances
              </h2>
              <p className="text-xs text-slate-500">
                Ingredients to flag in recipes, grocery scans, and nutrition advice.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {COMMON_ALLERGIES.map((allergy) => {
                const isSelected = profile.allergies.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      isSelected
                        ? "bg-rose-600 border-rose-600 text-white shadow-sm"
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

          {/* Health Requirements Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Health & Medical Requirements
              </h2>
              <p className="text-xs text-slate-500">
                Provide notes on specific medical goals, conditions, or doctor guidelines (e.g. Low sodium, Diabetic-friendly, High iron).
              </p>
            </div>

            <textarea
              rows={3}
              value={profile.health_requirements}
              onChange={(e) =>
                setProfile((prev) => ({ ...prev, health_requirements: e.target.value }))
              }
              placeholder="e.g., Focus on low-glycemic index foods and limit daily sodium intake under 2000mg."
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/"
              className="px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Profile...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
