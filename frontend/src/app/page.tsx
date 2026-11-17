"use client";

import { useEffect, useState } from "react";

type BackendHealth = {
  status: string;
  service: string;
  environment: string;
  database: string;
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", description: "System overview & stats" },
  { id: "nutrition", label: "Nutrition", description: "Nutritional tracking & profiles" },
  { id: "grocery", label: "Grocery Management", description: "Pantry & inventory controls" },
  { id: "price", label: "Price Intelligence", description: "Market comparisons & deals" },
  { id: "ai", label: "AI Assistant", description: "Smart recipes & food guidance" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setHealth(data);
    } catch (err: unknown) {
      setHealth(null);
      setError(err instanceof Error ? err.message : "Unable to reach server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const activeItem = NAV_ITEMS.find((item) => item.id === activeTab);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col p-6">
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">FoodBridge AI</h1>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Phase 0 Foundation
              </span>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* API Connection Status Indicator */}
        <div className="mt-auto border-t border-slate-100 pt-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Backend Status
              </span>
              <button
                onClick={checkHealth}
                className="text-xs text-emerald-600 hover:underline"
                title="Retry Health Check"
              >
                Refresh
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  loading
                    ? "bg-amber-400 animate-pulse"
                    : health
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />
              <span className="text-xs font-medium">
                {loading
                  ? "Checking..."
                  : health
                  ? "Connected (FastAPI)"
                  : "Disconnected"}
              </span>
            </div>

            {error && !loading && (
              <p className="mt-1 text-[11px] text-rose-600 leading-tight">
                {error} (target: {apiUrl})
              </p>
            )}

            {health && (
              <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 space-y-0.5">
                <div>Env: <span className="font-mono text-slate-800">{health.environment}</span></div>
                <div>DB: <span className="font-mono text-slate-800">{health.database}</span></div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-800">
            {activeItem?.label}
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">
              API: {apiUrl}
            </span>
          </div>
        </header>

        <section className="p-8 flex-1">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {activeItem?.label} Placeholder
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {activeItem?.description}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  Placeholder (Phase 0)
                </span>
              </div>

              <div className="mt-6 border-2 border-dashed border-slate-200 rounded-lg p-10 text-center">
                <p className="text-sm text-slate-600 font-medium">
                  {activeItem?.label} module placeholder.
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Feature implementations will follow in subsequent phases.
                </p>
              </div>
            </div>

            {/* Architecture Overview Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-3">
                Phase 0 Foundation Overview
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-700">Frontend</div>
                  <div className="text-slate-500 mt-1">Next.js 16 + React 19 + TypeScript + Tailwind CSS</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-700">Backend</div>
                  <div className="text-slate-500 mt-1">FastAPI + Uvicorn + Pydantic Settings</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="font-semibold text-slate-700">Database</div>
                  <div className="text-slate-500 mt-1">Supabase Client configured via environment variables</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
