"use client";

import BackgroundMusicPlayer from "@/app/components/BackgroundMusicButton";
import Link from "next/link";

export default function GameHeader() {
  return (
    <header className="text-center mb-12">
      <Link href={"/"}>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic font-light leading-none tracking-tight">
          Light Souls!
        </h1>
      </Link>
      <div className="w-20 h-px bg-zinc-600 mx-auto"></div>
      <BackgroundMusicPlayer
        src="/bgm.mp3"
        className="absolute right-5 top-5"
      />
    </header>
  );
}
