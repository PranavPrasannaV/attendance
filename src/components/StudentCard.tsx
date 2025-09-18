"use client";
import Image from "next/image";
import { Student } from "@/lib/types";
import { API_URL } from "@/lib/api";

type Props = {
  student: Student;
  onRemove?: (id: Student["id"]) => void;
  attendanceStatus?: {
    present: boolean;
    confidence?: number;
    checked_in_at?: string;
  };
};

export default function StudentCard({ student, onRemove, attendanceStatus }: Props) {
  const src = student.image_url
    ? (student.image_url.startsWith("http")
        ? student.image_url
        : `${API_URL}${student.image_url.startsWith("/") ? "" : "/"}${student.image_url}`)
    : undefined;

  const isPresent = attendanceStatus?.present;
  const confidence = attendanceStatus?.confidence;
  const checkedInAt = attendanceStatus?.checked_in_at;

  return (
    <div className="relative rounded-lg border p-3 flex items-center gap-3 bg-white hover:shadow-sm transition-shadow">
      {/* Status Badge */}
      {attendanceStatus && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            isPresent 
              ? "bg-green-100 text-green-800 border border-green-200" 
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}>
            {isPresent ? "Present" : "Absent"}
          </div>
        </div>
      )}

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
        
        {/* Attendance Details */}
        {attendanceStatus && isPresent && (
          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
            {confidence && (
              <div>Confidence: {(confidence * 100).toFixed(0)}%</div>
            )}
            {checkedInAt && (
              <div>
                Checked in: {new Date(checkedInAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        )}
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
