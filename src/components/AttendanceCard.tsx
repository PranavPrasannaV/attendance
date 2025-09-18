"use client";
import Image from "next/image";
import { API_URL } from "@/lib/api";

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

type Props = {
  status: AttendanceStatus;
};

export default function AttendanceCard({ status }: Props) {
  const { student, present, confidence, checked_in_at } = status;
  
  const src = student.image_url
    ? (student.image_url.startsWith("http")
        ? student.image_url
        : `${API_URL}${student.image_url.startsWith("/") ? "" : "/"}${student.image_url}`)
    : undefined;

  return (
    <div className="relative rounded-xl border bg-white shadow-sm p-4 hover:shadow-md transition-shadow">
      {/* Status Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          present 
            ? "bg-green-100 text-green-800 border border-green-200" 
            : "bg-gray-100 text-gray-600 border border-gray-200"
        }`}>
          {present ? "Present" : "Absent"}
        </div>
      </div>

      {/* Student Info */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
          {src ? (
            <Image
              src={src}
              alt={student.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No Photo
            </div>
          )}
        </div>
        
        <div>
          <div className="font-medium text-gray-900">{student.name}</div>
          <div className="text-xs text-gray-500">ID: {String(student.id)}</div>
        </div>

        {/* Attendance Details */}
        {present && (
          <div className="text-xs text-gray-500 space-y-1">
            {confidence && (
              <div>Confidence: {(confidence * 100).toFixed(0)}%</div>
            )}
            {checked_in_at && (
              <div>
                Checked in: {new Date(checked_in_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}