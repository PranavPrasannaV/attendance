"use client";
import { useEffect, useRef, useState } from "react";
import type { AttendanceCheckInResult } from "@/lib/types";

type Props = {
  onCapture: (blob: Blob) => Promise<AttendanceCheckInResult>;
};

export default function WebcamCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<AttendanceCheckInResult | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError("Unable to access webcam");
      }
    })();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capture = async () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setShowModal(true);
      setProcessing(true);
      setResult(null);
      setCaptureError(null);
      try {
        const res = await onCapture(blob);
        setResult(res);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to check in";
        setCaptureError(msg);
      } finally {
        setProcessing(false);
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div className="space-y-2">
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <video ref={videoRef} className="w-full max-w-md rounded border" />
      <canvas ref={canvasRef} className="hidden" />
      <button
        type="button"
        className="px-3 py-2 border rounded hover:bg-gray-50"
        onClick={capture}
        disabled={!ready}
      >
        Capture Photo
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Attendance Check-In</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {processing && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing your photo...</p>
              </div>
            )}

            {captureError && (
              <div className="text-center py-8">
                <div className="text-red-600 mb-4">❌</div>
                <p className="text-red-600">{captureError}</p>
              </div>
            )}

            {result && (
              <div className="text-center py-4">
                {result.matched && result.student ? (
                  <div>
                    <div className="text-green-600 text-2xl mb-2">✅</div>
                    <div className="font-medium text-lg mb-2">{result.student.name}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {result.already_checked_in ? "Already checked in" : "Present"}
                    </div>
                    {result.checked_in_at && (
                      <div className="text-sm text-gray-500">
                        Checked in at: {new Date(result.checked_in_at).toLocaleTimeString()}
                      </div>
                    )}
                    {typeof result.confidence === "number" && (
                      <div className="text-sm text-gray-500">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-red-600 text-2xl mb-2">❌</div>
                    <div className="text-gray-600">Student not found in database</div>
                  </div>
                )}
              </div>
            )}

            {!processing && !captureError && !result && (
              <div className="text-center py-8">
                <p className="text-gray-600">Initializing...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
