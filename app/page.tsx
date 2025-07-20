"use client";

import { useState } from "react";
import HomeHeader from "./components/HomeHeader";
import HomeMainContent from "./components/HomeMainContent";

export default function HomePage() {
  const [interacted, setInteracted] = useState(false);

  const handleClosePopup = () => {
    setInteracted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {!interacted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="max-w-md w-full p-6 rounded-xl text-white shadow-lg text-center space-y-6">
            <h1
              className="text-5xl md:text-6xl font-serif italic font-light leading-tight tracking-tight"
              aria-label="A dark tale begins"
            >
              A Dark Tale begins...
            </h1>

            <p className="text-sm text-gray-300">
              Support our project by starring the GitHub repository.
            </p>

            <a
              href="https://github.com/TheGhossst/LightSouls"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:underline text-sm"
            >
              View GitHub Repository →
            </a>

            <button
              onClick={handleClosePopup}
              className="w-full mt-2 px-4 py-2 bg-white/80 hover:bg-white text-black transition-colors rounded-md text-sm font-medium"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {interacted && (
        <>
          <HomeHeader />
          <HomeMainContent />
        </>
      )}
    </div>
  );
}
