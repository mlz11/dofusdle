import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dofusdle-music-muted";

function capturePlayError(error: unknown) {
	if (error instanceof DOMException && error.name === "NotAllowedError") return;
	import("@sentry/react").then((Sentry) => {
		Sentry.captureException(error, {
			tags: { feature: "theme-music" },
		});
	});
}

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
		let wasPlayingBeforeBlur = false;

		const removeClickListener = () => {
			document.removeEventListener("click", handleClick);
		};

		if (!muted) {
			audio.play().then(removeClickListener).catch(capturePlayError);
		}

		const handleClick = () => {
			if (!audio.paused || audioRef.current !== audio) return;
			if (localStorage.getItem(STORAGE_KEY) !== "true") {
				audio.play().catch(capturePlayError);
			}
			removeClickListener();
		};
		document.addEventListener("click", handleClick);

		const handleFocusLoss = () => {
			if (audio.paused) return;
			wasPlayingBeforeBlur = true;
			audio.pause();
		};

		const handleFocusGain = () => {
			if (!wasPlayingBeforeBlur) return;
			wasPlayingBeforeBlur = false;
			if (localStorage.getItem(STORAGE_KEY) !== "true") {
				audio.play().catch(capturePlayError);
			}
		};

		const handleVisibilityChange = () => {
			if (document.hidden) handleFocusLoss();
			else handleFocusGain();
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("blur", handleFocusLoss);
		window.addEventListener("focus", handleFocusGain);

		return () => {
			audio.pause();
			audioRef.current = null;
			removeClickListener();
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("blur", handleFocusLoss);
			window.removeEventListener("focus", handleFocusGain);
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
					audio.play().catch(capturePlayError);
				}
			}
			return next;
		});
	}, []);

	return { isMuted, toggle };
}
