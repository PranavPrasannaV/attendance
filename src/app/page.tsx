"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Student, AttendanceCheckInResult } from "@/lib/types";
import StudentCard from "@/components/StudentCard";
import UploadImage from "@/components/UploadImage";
import WebcamCapture from "@/components/WebcamCapture";
import AttendanceCard from "@/components/AttendanceCard";

type AttendanceStatus = {
  student: {
    id: number | string;
    name: string;
    image_url?: string;
    created_at: string;
  };
  present: boolean;
  confidence?: number;
  checked_in_at?: string;
};

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<AttendanceCheckInResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [attendanceList, setAttendanceList] = useState<AttendanceStatus[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const apiUrl = useMemo(() => process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000", []);

  const load = async () => {
    try {
      const data = await api.get<Student[]>("/students");
      setStudents(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load students";
      setError(msg);
    }
  };

  const loadAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const data = await api.get<AttendanceStatus[]>(`/attendance/status/${date}`);
      setAttendanceList(data);
    } catch (e: unknown) {
      console.error("Failed to load attendance:", e);
      setAttendanceList([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [date]);

  const addStudent = async () => {
    if (!name) return;
    setLoadingAdd(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("name", name);
      if (file) fd.append("image", file);
      const created = await api.post<Student>("/students", fd);
      setStudents((s) => [created, ...s]);
      setName("");
      setFile(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to add student";
      setError(msg);
    } finally {
      setLoadingAdd(false);
    }
  };

  const remove = async (id: Student["id"]) => {
    try {
      await api.del(`/students/${id}`);
      setStudents((s) => s.filter((x) => String(x.id) !== String(id)));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to remove student";
      setError(msg);
    }
  };

  const onCapture = async (blob: Blob) => {
    setChecking(true);
    setResult(null);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("photo", blob, "capture.jpg");
      fd.append("date", date);
      const r = await api.post<AttendanceCheckInResult>("/attendance/check-in", fd);
      setResult(r);
      // Reload attendance after successful check-in
      if (r.matched) {
        await loadAttendance();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to check in";
      setError(msg);
    } finally {
      setChecking(false);
    }
  };

  const presentCount = attendanceList.filter(item => item.present).length;
  const totalCount = attendanceList.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900"></div>
            <h1 className="text-xl font-semibold tracking-tight">Attendance Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs text-slate-500">API: {apiUrl}</div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Attendance Dashboard Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Student Attendance</h2>
            <button
              onClick={() => {
                load();
                loadAttendance();
              }}
              disabled={loadingAdd || loadingAttendance}
              className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingAdd || loadingAttendance ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Date Selector and Stats */}
          <div className="flex items-center justify-between bg-white rounded-xl border shadow-sm p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>Present: {presentCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                <span>Absent: {totalCount - presentCount}</span>
              </div>
              <div className="font-medium">
                Total: {totalCount}
              </div>
            </div>
          </div>

          {/* Students Grid with Attendance */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {students.map((student) => {
              const attendanceStatus = attendanceList.find(
                (att) => String(att.student.id) === String(student.id)
              );
              return (
                <StudentCard
                  key={String(student.id)}
                  student={student}
                  onRemove={remove}
                  attendanceStatus={attendanceStatus ? {
                    present: attendanceStatus.present,
                    confidence: attendanceStatus.confidence,
                    checked_in_at: attendanceStatus.checked_in_at
                  } : undefined}
                />
              );
            })}
          </div>

          {students.length === 0 && !loadingAdd && (
            <div className="text-center py-8 text-gray-500 bg-white rounded-xl border">
              No students yet. Add one below.
            </div>
          )}
        </section>

        <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Add Student */}
        <section className="space-y-6">
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Add New Student</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-slate-600">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="text-sm text-slate-600">Photo</label>
                <div className="mt-1"><UploadImage onSelected={setFile} /></div>
              </div>
              <button
                onClick={addStudent}
                disabled={!name || loadingAdd}
                className="self-start h-10 px-4 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {loadingAdd ? "Adding..." : "Add Student"}
              </button>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </div>
          </div>
        </section>

        {/* Right: Check-In */}
        <section className="space-y-6">
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Check-In</h3>
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm text-slate-600">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-300"
              />
            </div>
            <WebcamCapture onCapture={onCapture} />
            {checking && <div className="mt-3 text-sm">Checking...</div>}
            {result && (
              <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                {result.matched && result.student ? (
                  <div>
                    <div className="font-medium">Present: {result.student.name}</div>
                    <div className="text-sm text-slate-600">Date: {result.date}</div>
                  </div>
                ) : (
                  <div>No match found.</div>
                )}
              </div>
            )}
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">Set NEXT_PUBLIC_API_URL to your FastAPI server URL.</footer>
        </div>
      </main>
    </div>
  );
}
