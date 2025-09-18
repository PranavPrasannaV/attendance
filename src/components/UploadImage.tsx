"use client";
import { useRef, useState } from "react";

type Props = {
  onSelected: (file: File) => void;
};

export default function UploadImage({ onSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setPreview(URL.createObjectURL(f));
            onSelected(f);
          }
        }}
      />
      <button
        type="button"
        className="px-3 py-2 border rounded hover:bg-gray-50"
        onClick={() => inputRef.current?.click()}
      >
        Choose Photo
      </button>
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded" />
      )}
    </div>
  );
}
