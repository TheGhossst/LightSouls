"use client";

import { useEffect, useState } from "react";
import BackgroundMusicPlayer from "@/app/components/BackgroundMusicButton";

export default function BossHeader() {
  const bossNames = [
    "The Penitent King, Valerius",
    "Grave-Limb, the Amalgamation",
    "The Sentinel of a Faded Star",
    "The Thrice-Blasphemed Pontiff",
    "Matriarch of the Rusting Fen",
    "The Final, Lingering Echo",
    "The Twin Heresiarchs, Ilsa and Orin",
    "The Eyeless Watcher",
    "Cainhurst, the Gloom-Warden",
    "The Aureate Lullaby",
  ];

  const [selectedBossName, setSelectedBossName] = useState<string | null>(null);

  useEffect(() => {
    const name = bossNames[Math.floor(Math.random() * bossNames.length)];
    setSelectedBossName(name);
  }, []);

  if (!selectedBossName) return null;

  return (
    <header className="text-center mb-12">
      <div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif italic font-light leading-none tracking-tight">
          {selectedBossName}
        </h1>
      </div>
      <div className="w-20 h-px bg-zinc-600 mx-auto"></div>
    </header>
  );
}
