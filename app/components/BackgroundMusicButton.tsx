import React, { useEffect, useRef, useState } from "react";
import { VolumeOff, Volume1 } from "lucide-react";

interface BackgroundMusicPlayerProps {
  src: string;
  volume?: number;
  className?: string;
}

const BackgroundMusicPlayer: React.FC<BackgroundMusicPlayerProps> = ({
  src,
  volume = 0.3,
  className,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = true;
    audioRef.current = audio;

    // Load and prepare the audio
    audio.load();

    return () => {
      audio.pause();
    };
  }, [src, volume]);

  const toggleMute = async () => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.muted = !audio.muted;
    setIsMuted(audio.muted);

    if (audio.paused) {
      try {
        await audio.play();
      } catch (err) {
        console.warn("Playback failed:", err);
      }
    }
  };

  return (
    <button
      onClick={toggleMute}
      className={`px-4 py-2 text-sm rounded bg-gray-900 text-white hover:bg-gray-700 ${className}`}
    >
      {isMuted ? <VolumeOff color="grey" /> : <Volume1 />}
    </button>
  );
};

export default BackgroundMusicPlayer;
