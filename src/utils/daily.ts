import type { Monster } from "../types";

export function getTodayKey(): string {
	const today = new Date();
	const paris = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Europe/Paris",
		year: "numeric",
		month: "numeric",
		day: "numeric",
	}).formatToParts(today);
	const y = paris.find((p) => p.type === "year")?.value;
	const m = paris.find((p) => p.type === "month")?.value;
	const d = paris.find((p) => p.type === "day")?.value;
	return `${y}-${Number(m)}-${Number(d)}`;
}

function hash(str: string): number {
	let h = 0;
	for (const ch of str) {
		h = (h << 5) - h + ch.charCodeAt(0);
		h |= 0;
	}
	return h;
}

export function getDailyMonster(monsters: Monster[]): Monster {
	const seed = getTodayKey();
	let best = monsters[0];
	let bestScore = -Infinity;
	for (const monster of monsters) {
		const score = hash(`${seed}-${monster.id}`);
		if (score > bestScore) {
			bestScore = score;
			best = monster;
		}
	}
	return best;
}
