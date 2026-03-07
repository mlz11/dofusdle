import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "dofusdle-music-muted";
const TARGET_VOLUME = 0.05;
const FADE_DURATION_MS = 4000;
const FADE_INTERVAL_MS = 50;

function fadeIn(audio: HTMLAudioElement) {
	const steps = FADE_DURATION_MS / FADE_INTERVAL_MS;
	const increment = TARGET_VOLUME / steps;
	audio.volume = 0;
	let current = 0;
	const interval = setInterval(() => {
		current += increment;
		if (current >= TARGET_VOLUME) {
			audio.volume = TARGET_VOLUME;
			clearInterval(interval);
		} else {
			audio.volume = current;
		}
	}, FADE_INTERVAL_MS);
	return interval;
}

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
	const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const [isMuted, setIsMuted] = useState(false);

	const stopFade = useCallback(() => {
		if (fadeIntervalRef.current !== null) {
			clearInterval(fadeIntervalRef.current);
			fadeIntervalRef.current = null;
		}
	}, []);

	const playWithFade = useCallback(
		(audio: HTMLAudioElement) => {
			stopFade();
			fadeIntervalRef.current = fadeIn(audio);
			return audio.play().catch(capturePlayError);
		},
		[stopFade],
	);

	const pauseWithStop = useCallback(
		(audio: HTMLAudioElement) => {
			stopFade();
			audio.pause();
		},
		[stopFade],
	);

	useEffect(() => {
		const muted = localStorage.getItem(STORAGE_KEY) === "true";
		setIsMuted(muted);

		const audio = new Audio("/audio/theme.mp3");
		audio.loop = true;
		audio.volume = 0;
		audioRef.current = audio;
		let wasPlayingBeforeBlur = false;

		const removeClickListener = () => {
			document.removeEventListener("click", handleClick);
		};

		if (!muted) {
			playWithFade(audio).then(removeClickListener);
		}

		const handleClick = () => {
			if (!audio.paused || audioRef.current !== audio) return;
			if (localStorage.getItem(STORAGE_KEY) !== "true") {
				playWithFade(audio);
			}
			removeClickListener();
		};
		document.addEventListener("click", handleClick);

		const handleFocusLoss = () => {
			if (audio.paused) return;
			wasPlayingBeforeBlur = true;
			pauseWithStop(audio);
		};

		const handleFocusGain = () => {
			if (!wasPlayingBeforeBlur) return;
			wasPlayingBeforeBlur = false;
			if (localStorage.getItem(STORAGE_KEY) !== "true") {
				playWithFade(audio);
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
			pauseWithStop(audio);
			audioRef.current = null;
			removeClickListener();
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("blur", handleFocusLoss);
			window.removeEventListener("focus", handleFocusGain);
		};
	}, [playWithFade, pauseWithStop]);

	const toggle = useCallback(() => {
		setIsMuted((prev) => {
			const next = !prev;
			localStorage.setItem(STORAGE_KEY, String(next));
			const audio = audioRef.current;
			if (audio) {
				if (next) {
					pauseWithStop(audio);
				} else {
					playWithFade(audio);
				}
			}
			return next;
		});
	}, [playWithFade, pauseWithStop]);

	return { isMuted, toggle };
}
