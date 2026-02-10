import confetti from "canvas-confetti";
import { useEffect, useMemo, useState } from "react";
import monstersData from "../../data/monsters.json";
import type { GameStats, GuessResult, Monster } from "../../types";
import { compareMonsters } from "../../utils/compare";
import { getDailyMonster } from "../../utils/daily";
import {
	loadProgress,
	loadStats,
	recordWin,
	saveProgress,
} from "../../utils/storage";
import ColorLegend from "./ColorLegend";
import GuessGrid from "./GuessGrid";
import SearchBar from "./SearchBar";
import Victory from "./Victory";

const monsters: Monster[] = monstersData as Monster[];

export default function Game() {
	const target = useMemo(() => getDailyMonster(monsters), []);

	const [results, setResults] = useState<GuessResult[]>([]);
	const [won, setWon] = useState(false);
	const [stats, setStats] = useState<GameStats>(loadStats());
	const [newGuessIndex, setNewGuessIndex] = useState(-1);
	const [showLegend, setShowLegend] = useState(true);

	// Restore progress on mount
	useEffect(() => {
		const progress = loadProgress();
		if (progress) {
			const restored: GuessResult[] = [];
			for (const name of progress.guesses) {
				const m = monsters.find((m) => m.name === name);
				if (m) restored.push(compareMonsters(m, target));
			}
			setResults(restored);
			setWon(progress.won);
			if (progress.won) setStats(loadStats());
		}
	}, [target]);

	const usedIds = useMemo(
		() => new Set(results.map((r) => r.monster.id)),
		[results],
	);

	function handleGuess(monster: Monster) {
		if (won || usedIds.has(monster.id)) return;

		const result = compareMonsters(monster, target);
		const newResults = [...results, result];
		setResults(newResults);
		setNewGuessIndex(newResults.length - 1);

		const isWin = monster.id === target.id;
		if (isWin) {
			setWon(true);
			const newStats = recordWin(newResults.length);
			setStats(newStats);
			setTimeout(() => {
				confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
			}, 1000);
		}

		saveProgress(
			newResults.map((r) => r.monster.name),
			isWin,
		);
	}

	return (
		<div className="game">
			<p className="game-subtitle">
				Dofus Retro 1.29 — Devine le monstre du jour
			</p>
			<SearchBar
				monsters={monsters}
				usedIds={usedIds}
				onSelect={handleGuess}
				disabled={won}
			/>
			<GuessGrid results={results} newGuessIndex={newGuessIndex} />
			{results.length > 0 && showLegend && !won && (
				<ColorLegend onClose={() => setShowLegend(false)} />
			)}
			{won && (
				<Victory results={results} stats={stats} targetName={target.name} />
			)}
		</div>
	);
}
