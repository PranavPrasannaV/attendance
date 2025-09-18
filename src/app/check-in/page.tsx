"use client";
import WebcamCapture from "@/components/WebcamCapture";
import { api } from "@/lib/api";
import type { AttendanceCheckInResult } from "@/lib/types";
import { useState } from "react";

export default function CheckInPage() {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const onCapture = async (blob: Blob): Promise<AttendanceCheckInResult> => {
    const fd = new FormData();
    fd.append("photo", blob, "capture.jpg");
    fd.append("date", date);
    const r = await api.post<AttendanceCheckInResult>("/attendance/check-in", fd);
    return r;
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
    </div>
  );
}
