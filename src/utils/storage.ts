import type { DailyProgress, GameStats } from "../types";
import { getTodayKey } from "./daily";

const PROGRESS_KEY = "ankamadle-progress";
const STATS_KEY = "ankamadle-stats";

function defaultStats(): GameStats {
	return {
		gamesPlayed: 0,
		gamesWon: 0,
		currentStreak: 0,
		maxStreak: 0,
		guessDistribution: {},
	};
}

export function loadProgress(): DailyProgress | null {
	try {
		const raw = localStorage.getItem(PROGRESS_KEY);
		if (!raw) return null;
		const progress: DailyProgress = JSON.parse(raw);
		if (progress.date !== getTodayKey()) return null;
		return progress;
	} catch {
		return null;
	}
}

export function saveProgress(
	guesses: string[],
	won: boolean,
	hint1Revealed = false,
	hint2Revealed = false,
): void {
	const progress: DailyProgress = {
		date: getTodayKey(),
		guesses,
		won,
		hint1Revealed,
		hint2Revealed,
	};
	localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function loadStats(): GameStats {
	try {
		const raw = localStorage.getItem(STATS_KEY);
		if (!raw) return defaultStats();
		return JSON.parse(raw);
	} catch {
		return defaultStats();
	}
}

export function saveStats(stats: GameStats): void {
	localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export function recordWin(guessCount: number): GameStats {
	const stats = loadStats();
	stats.gamesPlayed += 1;
	stats.gamesWon += 1;
	stats.currentStreak += 1;
	if (stats.currentStreak > stats.maxStreak) {
		stats.maxStreak = stats.currentStreak;
	}
	stats.guessDistribution[guessCount] =
		(stats.guessDistribution[guessCount] || 0) + 1;
	saveStats(stats);
	return stats;
}
