"use client";

import ClickCircleGame from "./ClickGame";

export default function GameLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="flex items-center space-x-3 mb-6">
        <span className="font-mono text-zinc-400">Your legacy is being crafted</span>
        <span className="font-mono text-zinc-400 animate-pulse">...</span>
      </div>
      <ClickCircleGame />
    </div>
  );
}
