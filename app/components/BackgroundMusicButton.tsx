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
  const [isMuted, setIsMuted] = useState(true); // start muted

  // Set volume once audio element is ready
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Enable sound on first user interaction (mousemove or click)
  useEffect(() => {
    const enableSound = () => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.muted = false;
      audio.volume = volume;
      setIsMuted(false);

      audio
        .play()
        .then(() => {
          console.log("Autoplay started after interaction");
        })
        .catch((err) => {
          console.warn("Autoplay failed:", err);
        });

      // Remove listeners after first interaction
      document.removeEventListener("mousemove", enableSound);
      document.removeEventListener("click", enableSound);
    };

    document.addEventListener("mousemove", enableSound);
    document.addEventListener("click", enableSound);

    return () => {
      document.removeEventListener("mousemove", enableSound);
      document.removeEventListener("click", enableSound);
    };
  }, [volume]);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newMuted = !audio.muted;
    audio.muted = newMuted;
    setIsMuted(newMuted);
  };

  return (
    <>
      {/* Hidden autoplaying audio tag */}
      <audio
        ref={audioRef}
        src={src}
        autoPlay
        loop
        style={{ display: "none" }}
      />

      {/* Mute toggle button */}
      <button
        onClick={toggleMute}
        className={`px-4 py-2 text-sm rounded bg-gray-900 text-white hover:bg-gray-700 ${className}`}
        aria-label={`Background music - ${isMuted ? "muted" : "playing"}`}
        aria-pressed={!isMuted}
      >
        {isMuted ? (
          <VolumeOff color="grey" aria-hidden="true" />
        ) : (
          <Volume1 aria-hidden="true" />
        )}
      </button>
    </>
  );
};

export default BackgroundMusicPlayer;
