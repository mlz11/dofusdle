import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dofusdle-music-muted";

export function useMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const muted = localStorage.getItem(STORAGE_KEY) === "true";
    setIsMuted(muted);

    const audio = new Audio("/audio/theme.mp3");
    audio.loop = true;
    audio.volume = 0.05;
    audioRef.current = audio;

    if (!muted) {
      audio.play().catch(() => {});
    }

    const handleClick = () => {
      if (!audio.paused || audioRef.current !== audio) return;
      if (localStorage.getItem(STORAGE_KEY) !== "true") {
        audio.play().catch(() => {});
      }
      document.removeEventListener("click", handleClick);
    };
    document.addEventListener("click", handleClick);

    return () => {
      audio.pause();
      audioRef.current = null;
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const toggle = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      const audio = audioRef.current;
      if (audio) {
        if (next) {
          audio.pause();
        } else {
          audio.play().catch(() => {});
        }
      }
      return next;
    });
  }, []);

  return { isMuted, toggle };
}
