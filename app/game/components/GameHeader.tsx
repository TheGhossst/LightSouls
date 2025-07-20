"use client";

import BackgroundMusicPlayer from "@/app/components/BackgroundMusicButton";

export default function GameHeader() {
  return (
    <header className="text-center mb-12">
      <BackgroundMusicPlayer
        src="/bgm.mp3"
        className="absolute right-5 top-5"
      />
    </header>
  );
}
