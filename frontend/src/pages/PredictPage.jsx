import React, { useEffect, useState, useMemo } from "react";
import { predictHeartRisk, getAutoPredict } from "../lib/api";
const initialState = {
  Age: 55,
  Sex: 1,
  Chest_pain_type: 3,
  BP: 130,
  Cholesterol: 250,
  FBS_over_120: 0,
  EKG_results: 1,
  Max_HR: 150,
  Exercise_angina: 0,
  ST_depression: 1.2,
  Slope_of_ST: 2,
  Number_of_vessels_fluro: 0,
  Thallium: 7,
};

export default function PredictPage() {
  const [formData, setFormData] = useState(initialState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const data = await getAutoPredict();

      setResult({
        ...data.prediction,
        sensor_data: data.sensor_data
      });

    } catch (err) {
      console.log(err);
    }
  }, 7000);

  return () => clearInterval(interval);
}, []);
  const fields = useMemo(
    () => [
      ["Age", "number"],
      ["Sex", "number"],
      ["Chest_pain_type", "number"],
      ["BP", "number"],
      ["Cholesterol", "number"],
      ["FBS_over_120", "number"],
      ["EKG_results", "number"],
      ["Max_HR", "number"],
      ["Exercise_angina", "number"],
      ["ST_depression", "number"],
      ["Slope_of_ST", "number"],
      ["Number_of_vessels_fluro", "number"],
      ["Thallium", "number"],
    ],
    [],
  );

  function onChange(name, value) {
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "ST_depression" ? Number(value) : Number.parseInt(value, 10),
    }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predictHeartRisk(formData);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function riskBadgeClass(risk) {
    const text = String(risk || "").toLowerCase();
    if (text.includes("immediate") || text.includes("high")) {
      return "border-rose-400/40 bg-rose-500/15 text-rose-100";
    }
    if (text.includes("moderate")) {
      return "border-amber-400/40 bg-amber-500/15 text-amber-100";
    }
    return "border-emerald-400/40 bg-emerald-500/15 text-emerald-100";
  }

  function predictionBadgeClass(prediction) {
    return prediction === "Presence"
      ? "border-rose-400/40 bg-rose-500/15 text-rose-100"
      : "border-emerald-400/40 bg-emerald-500/15 text-emerald-100";
  }

  function confidencePercent(score) {
    const safeScore = Number(score || 0);
    const sigmoid = 1 / (1 + Math.exp(-safeScore));
    return Math.max(0, Math.min(100, Math.round(sigmoid * 100)));
  }

  const sensorOnline = result?.sensor_data != null;
  const heartRate = result?.sensor_data?.heart_rate ?? null;
  const spo2 = result?.sensor_data?.spo2 ?? null;

  return (
    <section className="flex flex-col gap-4 fade-up">

      {/* ── LIVE RESULT — top ── */}
      <aside className="glass-panel card-hover idle-glow idle-pulse-line p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Live Result
          </h3>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${sensorOnline ? "animate-pulse bg-cyan-400" : "bg-slate-600"}`} />
            <span className="text-[10px] uppercase tracking-wider text-slate-500">
              {sensorOnline ? "Sensor Online" : "Sensor Offline"}
            </span>
          </div>
        </div>

        {/* ── Row 2: Prediction + Risk Tier ── */}
        <div className="mb-4 grid grid-cols-2 gap-3">
          {/* Prediction */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Prediction</p>
            {result ? (
              <>
                <p className={`mt-2 text-2xl font-bold ${result.prediction === "Presence" ? "text-rose-300" : "text-emerald-300"}`}>
                  {result.prediction}
                </p>
                <span className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${predictionBadgeClass(result.prediction)}`}>
                  {result.prediction === "Presence" ? "Heart Disease Detected" : "No Heart Disease"}
                </span>
              </>
            ) : (
              <p className="mt-2 text-3xl font-bold text-slate-600">--</p>
            )}
          </div>

          {/* Risk Tier */}
          <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Risk Tier</p>
            {result ? (
              <>
                <p className={`mt-2 text-2xl font-bold ${riskBadgeClass(result.risk_level).includes("rose") ? "text-rose-300" : riskBadgeClass(result.risk_level).includes("amber") ? "text-amber-300" : "text-emerald-300"}`}>
                  {result.risk_level}
                </p>
                <span className={`mt-2 inline-flex rounded-lg border px-2.5 py-1 text-xs font-semibold ${riskBadgeClass(result.risk_level)}`}>
                  {result.hospitalization_required ? "Action Required" : "Monitor Only"}
                </span>
              </>
            ) : (
              <p className="mt-2 text-3xl font-bold text-slate-600">--</p>
            )}
          </div>
        </div>

        {/* ── Sensor Cards: HR + SpO2 ── */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          {/* Heart Rate */}
          <div className={`rounded-xl border p-4 ${sensorOnline && heartRate ? "border-rose-400/30 bg-rose-500/10" : "border-slate-700 bg-slate-900/50"}`}>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Heart Rate</p>
            <p className={`mt-2 text-4xl font-bold tabular-nums ${sensorOnline && heartRate ? "text-rose-300" : "text-slate-600"}`}>
              {sensorOnline && heartRate != null ? heartRate : "--"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">bpm</p>
            {sensorOnline && heartRate != null && (
              <p className={`mt-2 text-xs font-medium ${heartRate > 100 ? "text-amber-400" : heartRate < 60 ? "text-amber-400" : "text-emerald-400"}`}>
                {heartRate > 100 ? "⚠ Tachycardia" : heartRate < 60 ? "⚠ Bradycardia" : "✓ Normal sinus rhythm"}
              </p>
            )}
            {!sensorOnline && <p className="mt-2 text-xs text-slate-600">No signal</p>}
          </div>

          {/* SpO2 */}
          <div className={`rounded-xl border p-4 ${sensorOnline && spo2 ? "border-cyan-400/30 bg-cyan-500/10" : "border-slate-700 bg-slate-900/50"}`}>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">SpO₂</p>
            <p className={`mt-2 text-4xl font-bold tabular-nums ${sensorOnline && spo2 ? "text-cyan-300" : "text-slate-600"}`}>
              {sensorOnline && spo2 != null ? spo2 : "--"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">%</p>
            {sensorOnline && spo2 != null && (
              <p className={`mt-2 text-xs font-medium ${spo2 < 95 ? "text-amber-400" : "text-emerald-400"}`}>
                {spo2 < 95 ? "⚠ Below normal threshold" : "✓ Normal saturation"}
              </p>
            )}
            {!sensorOnline && <p className="mt-2 text-xs text-slate-600">No signal</p>}
          </div>
        </div>

        {!result && !loading && (
          <p className="text-sm text-slate-500">
            Submit the form below to see prediction, risk level, and hospitalization guidance.
          </p>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
            Running model inference...
          </div>
        )}
        {result && (
          <div className="result-enter space-y-3 text-sm text-slate-200">
            <div className="result-item result-item-2 rounded-lg border border-slate-700 bg-slate-900/70 p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                <span>Model Confidence</span>
                <span>{confidencePercent(result.confidence_score)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-brand-500 transition-all duration-500"
                  style={{ width: `${confidencePercent(result.confidence_score)}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Raw score: {Number(result.confidence_score).toFixed(4)}
              </p>
            </div>

            <div
              className={`result-item result-item-3 rounded-lg border p-3 ${
                result.hospitalization_required
                  ? "border-rose-400/40 bg-rose-500/10"
                  : "border-emerald-400/40 bg-emerald-500/10"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-slate-300">
                Hospitalization Guidance
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                { result.risk_level && result.risk_level.toLowerCase().includes("immediate") ? "Immediate hospitalization required" :
                  result.risk_level && result.risk_level.toLowerCase().includes("high") ? "Hospitalization recommended" :
                  result.risk_level && result.risk_level.toLowerCase().includes("moderate") ? "Monitor closely, consider hospitalization" :
                  result.risk_level && result.risk_level.toLowerCase().includes("low") ? "No hospitalization needed, regular monitoring"
                  : ""}
              </p>
              <p className="mt-1 text-xs text-slate-300">{result.hospitalization_note}</p>
            </div>

            <div className="result-item result-item-4 flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-400">Risk Level:</span>
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${riskBadgeClass(result.risk_level)}`}>
                {result.risk_level}
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* ── PREDICTION WORKSPACE — below ── */}
      <div className="glass-panel card-hover p-5 md:p-6">
        <h2 className="text-xl font-bold text-white">Prediction Workspace</h2>
        <p className="mt-1 text-sm text-slate-400">
          Enter patient profile values to generate AI-assisted triage output.
        </p>

        <form
          className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2"
          onSubmit={onSubmit}
        >
          {fields.map(([name, type]) => (
            <label key={name} className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {name}
              </span>
              {name === "Sex" ? (
                <select
                  className="field-input"
                  value={formData[name]}
                  onChange={(e) => onChange(name, e.target.value)}
                  required
                >
                  <option value={0}>Female (0)</option>
                  <option value={1}>Male (1)</option>
                </select>
              ) : (
                <input
                  className="field-input"
                  type={type}
                  step={name === "ST_depression" ? "0.1" : "1"}
                  value={formData[name]}
                  onChange={(e) => onChange(name, e.target.value)}
                  required
                />
              )}
            </label>
          ))}

          <button
            className="interactive-button shine-button mt-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70 md:col-span-2"
            type="submit"
            disabled={loading}
          >
            {loading ? "Predicting..." : "Predict"}
          </button>
        </form>

        {error && (
          <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200">
            {error}
          </p>
        )}
      </div>

    </section>
  );
}