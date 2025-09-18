"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  onCapture: (blob: Blob) => void;
};

export default function WebcamCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const capture = () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => blob && onCapture(blob), "image/jpeg", 0.9);
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
    </div>
  );
}
