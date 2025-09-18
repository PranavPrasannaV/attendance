"use client";
import Image from "next/image";
import { Student } from "@/lib/types";
import { API_URL } from "@/lib/api";

type Props = {
  student: Student;
  onRemove?: (id: Student["id"]) => void;
};

export default function StudentCard({ student, onRemove }: Props) {
  const src = student.image_url
    ? (student.image_url.startsWith("http")
        ? student.image_url
        : `${API_URL}${student.image_url.startsWith("/") ? "" : "/"}${student.image_url}`)
    : undefined;
  return (
    <div className="rounded-lg border p-3 flex items-center gap-3">
      <div className="relative w-16 h-16 shrink-0 rounded overflow-hidden bg-gray-100">
        {src ? (
          <Image
            src={src}
            alt={student.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-gray-400 text-sm">
            No Photo
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="font-medium">{student.name}</div>
        <div className="text-xs text-gray-500">ID: {String(student.id)}</div>
      </div>
      {onRemove && (
        <button
          className="text-red-600 hover:text-red-700 text-sm px-2 py-1"
          onClick={() => onRemove(student.id)}
        >
          Remove
        </button>
      )}
    </div>
  );
}
