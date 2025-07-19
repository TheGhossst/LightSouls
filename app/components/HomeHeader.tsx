"use client";

import { Sparkles } from "lucide-react";

export default function HomeHeader() {
  return (
    <header className="flex justify-between items-start p-6 md:p-8">
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Sparkles className="w-4 h-4" />
        <span>Perfectly Accessible</span>
      </div>
    </header>
  );
}
