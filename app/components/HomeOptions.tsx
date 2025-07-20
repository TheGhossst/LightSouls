"use client";

import { Play } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef } from "react";

export default function HomeOptions() {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        linkRef.current?.click(); // Simulates a real click
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
        <div className="relative flex items-center justify-between p-8">
          <Link
            ref={linkRef}
            href="/game"
            className="cursor-pointer group/tag transition-all duration-300 ease-out hover:scale-105"
            aria-label="Start new game"
            role="button"
          >
            <div
              className="flex items-center px-12 py-3 rounded-xl bg-pulse group-hover:bg-white/20"
              aria-hidden="true"
            >
              <h2 className="text-xl font-medium text-gray-300 group-hover/tag:text-white transition-colors duration-300">
                Play Game
              </h2>
              <Play className="ml-2 text-white" aria-hidden="true" />
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
