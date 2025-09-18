"use client";
import WebcamCapture from "@/components/WebcamCapture";
import { api } from "@/lib/api";
import type { AttendanceCheckInResult } from "@/lib/types";
import { useState } from "react";

export default function CheckInPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<AttendanceCheckInResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onCapture = async (blob: Blob) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("photo", blob, "capture.jpg");
      fd.append("date", date);
      const r = await api.post<AttendanceCheckInResult>("/attendance/check-in", fd);
      setResult(r);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to check in";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Check-In</h1>
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded px-3 py-2"
        />
      </div>
      <WebcamCapture onCapture={onCapture} />
      {loading && <div>Checking...</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {result && (
        <div className="rounded border p-4">
          {result.matched && result.student ? (
            <div>
              <div className="font-medium">Present: {result.student.name}</div>
              {typeof result.confidence === "number" && (
                <div className="text-sm text-gray-500">Confidence: {(result.confidence * 100).toFixed(1)}%</div>
              )}
              <div className="text-sm text-gray-500">Date: {result.date}</div>
            </div>
          ) : (
            <div>No match found.</div>
          )}
        </div>
      )}
    </div>
  );
}
