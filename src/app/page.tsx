"use client";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { Student, AttendanceCheckInResult } from "@/lib/types";
import StudentCard from "@/components/StudentCard";
import UploadImage from "@/components/UploadImage";
import WebcamCapture from "@/components/WebcamCapture";

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [result, setResult] = useState<AttendanceCheckInResult | null>(null);
  const [checking, setChecking] = useState(false);

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

  useEffect(() => {
    load();
  }, []);

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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to check in";
      setError(msg);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900"></div>
            <h1 className="text-xl font-semibold tracking-tight">Attendance Dashboard</h1>
          </div>
          <div className="text-xs text-slate-500">API: {apiUrl}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 grid gap-8 lg:grid-cols-2">
        {/* Left: Add Student + List */}
        <section className="space-y-6">
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Add Student</h2>
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

          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Students</h2>
              <button
                onClick={load}
                className="text-sm px-3 py-1.5 rounded-lg border hover:bg-slate-50"
              >
                Refresh
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {students.map((s) => (
                <StudentCard key={String(s.id)} student={s} onRemove={remove} />
              ))}
            </div>
            {!students.length && (
              <div className="text-slate-500 text-sm">No students yet. Add one above.</div>
            )}
          </div>
        </section>

        {/* Right: Check-In */}
        <section className="space-y-6">
          <div className="rounded-2xl border bg-white shadow-sm p-6">
            <h2 className="text-lg font-medium mb-4">Check-In</h2>
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
                    {typeof result.confidence === "number" && (
                      <div className="text-sm text-slate-600">Confidence: {(result.confidence * 100).toFixed(1)}%</div>
                    )}
                    <div className="text-sm text-slate-600">Date: {result.date}</div>
                  </div>
                ) : (
                  <div>No match found.</div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-slate-500">Set NEXT_PUBLIC_API_URL to your FastAPI server URL.</footer>
    </div>
  );
}
