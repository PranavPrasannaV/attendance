"use client";
import { useEffect, useState } from "react";
import StudentCard from "@/components/StudentCard";
import UploadImage from "@/components/UploadImage";
import { api } from "@/lib/api";
import type { Student } from "@/lib/types";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
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
    setLoading(true);
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
      setLoading(false);
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

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Students</h1>
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
              placeholder="e.g. Alex Johnson"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Photo</label>
            <div className="mt-1">
              <UploadImage onSelected={setFile} />
            </div>
          </div>
          <button
            onClick={addStudent}
            disabled={!name || loading}
            className="h-10 px-4 border rounded bg-black text-white disabled:opacity-60"
          >
            {loading ? "Adding..." : "Add Student"}
          </button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {students.map((s) => (
          <StudentCard key={String(s.id)} student={s} onRemove={remove} />
        ))}
        {!students.length && (
          <div className="text-gray-500">No students yet. Add one above.</div>
        )}
      </div>
    </div>
  );
}
