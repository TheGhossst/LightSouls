"use client";

import React from "react";
import { Volume1, Loader2, X, Play, Pause } from "lucide-react";

interface SpeechButtonProps {
  text: string;
  speechState: "idle" | "generating" | "playing" | "paused";
  currentText: string | null;
  onStart: (text: string) => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  className?: string;
}

const SpeechButton: React.FC<SpeechButtonProps> = ({
  text,
  speechState,
  currentText,
  onStart,
  onPause,
  onResume,
  onCancel,
  className = "",
}) => {
  const isActive = text === currentText;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => {
          if (!isActive) {
            onStart(text);
            return;
          }
          if (speechState === "generating") {
            return;
          }
          if (speechState === "playing") {
            onPause();
          } else if (speechState === "paused") {
            onResume();
          } else {
            onStart(text);
          }
        }}
        disabled={isActive && speechState === "generating"}
        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isActive && speechState === "generating" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isActive && speechState === "playing" ? (
          <Pause className="w-4 h-4" />
        ) : isActive && speechState === "paused" ? (
          <Play className="w-4 h-4" />
        ) : (
          <Volume1 className="w-4 h-4" />
        )}
      </button>
      {isActive && speechState !== "idle" && (
        <button
          onClick={onCancel}
          className="p-2 bg-red-900 hover:bg-red-800 text-white rounded"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SpeechButton;
