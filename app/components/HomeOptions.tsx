"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function HomeOptions() {
  return (
    <>
      <style jsx>{`
        @keyframes bgPulse {
          0%,
          100% {
            background-color: rgba(255, 255, 255, 0.05);
          }
          50% {
            background-color: rgba(255, 255, 255, 0.15);
          }
        }
        .bg-pulse {
          animation: bgPulse 3s ease-in-out infinite;
        }
      `}</style>

      <div className="relative mx-auto group text-center">
        {/* Background blur on hover */}

        {/* Wider button */}
        <div className="relative flex items-center justify-between p-8 w-{80%}">
          <Link
            href="/game"
            className="cursor-pointer group/tag transition-all duration-300 ease-out hover:scale-105"
          >
            <div className="flex items-center px-12 py-3 rounded-xl bg-pulse">
              <h2 className="text-xl font-medium text-gray-300 group-hover/tag:text-white transition-colors duration-300">
                Play Game
              </h2>
              <Play className="ml-2 text-white" />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
