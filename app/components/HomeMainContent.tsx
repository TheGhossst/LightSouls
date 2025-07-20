"use client";

import HomeActionHint from "./HomeActionHint";
import HomeHero from "./HomeHero";
import HomeOptions from "./HomeOptions";

export default function HomeMainContent() {
  return (
    <main className="flex flex-col items-center justify-center px-6 md:px-8 min-h-[calc(100vh-200px)]">
      <HomeHero />
      <HomeOptions />
    </main>
  );
}
