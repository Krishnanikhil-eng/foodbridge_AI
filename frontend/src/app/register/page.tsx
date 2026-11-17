"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function RegisterPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        router.replace("/");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const emailRedirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined;

      const { data, error: authError } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName.trim(),
          },
          emailRedirectTo,
        },
      });

      if (authError) {
        const errorMsg = authError.message.toLowerCase();
        if (
          errorMsg.includes("already registered") ||
          errorMsg.includes("user already exists") ||
          authError.status === 400 ||
          authError.status === 422
        ) {
          setError("This email is already registered. Please log in.");
          return;
        }
        if (errorMsg.includes("rate limit") || authError.status === 429) {
          setError("Too many email requests. Please wait a moment before trying again.");
          return;
        }
        throw authError;
      }

      // Supabase Email Enumeration Protection:
      // If a user is already registered and email confirmation is on,
      // signUp returns a fake user object with an empty identities array: data.user.identities = []
      if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        setError("This email is already registered. Please log in.");
        return;
      }

      // Check if user confirmation email was triggered or user was created
      if (data?.user) {
        setSuccessMessage(
          "Registration successful! A verification link has been sent to your email. Please check your inbox to confirm your account."
        );
      } else {
        setSuccessMessage("Registration request received. Please check your email.");
      }
    } catch (err: unknown) {
      const rawMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during registration.";
      const lower = rawMessage.toLowerCase();
      if (
        lower.includes("already registered") ||
        lower.includes("user already exists")
      ) {
        setError("This email is already registered. Please log in.");
      } else {
        setError(rawMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans text-slate-600">
        <div className="flex items-center gap-2 text-sm">
          <span className="h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            F
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">FoodBridge AI</span>
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-slate-800">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Get started with intelligent nutrition & grocery planning
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          {successMessage ? (
            <div className="text-center py-4 space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Verification Email Sent</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {successMessage}
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center justify-between gap-2">
                  <span>{error}</span>
                  {error.includes("already registered") && (
                    <Link
                      href="/login"
                      className="font-semibold underline hover:text-rose-900 shrink-0"
                    >
                      Log in
                    </Link>
                  )}
                </div>
              )}

              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  disabled={loading}
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  disabled={loading}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={loading}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  disabled={loading}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors disabled:opacity-60"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
