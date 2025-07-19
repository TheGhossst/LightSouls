"use client";

import { Play } from "lucide-react";
import Link from "next/link";

export default function HomeOptions() {
  return (
    <div className="relative mx-auto group text-center">
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm border border-gray-800/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out"></div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/tag:opacity-100 transition-all duration-500 ease-out">
        <h1 className="text-6xl md:text-8xl font-light text-white/10 select-none whitespace-nowrap">
          Play Game
        </h1>
      </div>
      <div className="relative flex items-center justify-between p-8">
        <Link
          href="/game"
          className="cursor-pointer group/tag transition-all duration-300 ease-out hover:scale-105"
        >
          <div className="flex items-center">
            <h2 className="text-xl font-medium text-gray-400 group-hover/tag:text-white transition-colors duration-300">
              Play Game
            </h2>
            <Play className="ml-2" />
          </div>
        </Link>

      </div>
    </div>
  );
}
