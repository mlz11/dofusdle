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

interface Props {
	stats: GameStats;
	onStatsChange: (stats: GameStats) => void;
}

export default function Game({ stats, onStatsChange }: Props) {
	const [target, setTarget] = useState(() => getDailyMonster(monsters));
	const [devMode, setDevMode] = useState(false);

	const [results, setResults] = useState<GuessResult[]>([]);
	const [won, setWon] = useState(false);
	const [showVictory, setShowVictory] = useState(false);
	const [newGuessIndex, setNewGuessIndex] = useState(-1);

	// Restore progress on mount (skip in dev mode)
	useEffect(() => {
		if (devMode) return;
		const progress = loadProgress();
		if (progress) {
			const restored: GuessResult[] = [];
			for (const name of progress.guesses) {
				const m = monsters.find((m) => m.name === name);
				if (m) restored.push(compareMonsters(m, target));
			}
			setResults(restored);
			setWon(progress.won);
			if (progress.won) {
				setShowVictory(true);
				onStatsChange(loadStats());
			}
		}
	}, [target, devMode, onStatsChange]);

	function resetGame() {
		const randomMonster = monsters[Math.floor(Math.random() * monsters.length)];
		setTarget(randomMonster);
		setResults([]);
		setWon(false);
		setShowVictory(false);
		setNewGuessIndex(-1);
	}

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
			onStatsChange(newStats);
			// First confetti burst right as last cell finishes flipping
			setTimeout(() => {
				confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
			}, 1200);
			// Second smaller burst for extra celebration
			setTimeout(() => {
				confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
			}, 1700);
			// Show victory modal after cells flip + confetti enjoyed
			setTimeout(() => {
				setShowVictory(true);
			}, 2000);
		}

		if (!devMode) {
			saveProgress(
				newResults.map((r) => r.monster.name),
				isWin,
			);
		}
	}

	return (
		<div className="game">
			{import.meta.env.DEV && (
				<div className="dev-toolbar">
					<label>
						<input
							type="checkbox"
							checked={devMode}
							onChange={(e) => setDevMode(e.target.checked)}
						/>
						Dev mode
					</label>
					{devMode && (
						<>
							<button type="button" onClick={resetGame}>
								New Game
							</button>
							<span>Target: {target.name}</span>
						</>
					)}
				</div>
			)}
			<SearchBar
				monsters={monsters}
				usedIds={usedIds}
				onSelect={handleGuess}
				disabled={won}
			/>
			<GuessGrid results={results} newGuessIndex={newGuessIndex} />
			{results.length > 0 && !won && <ColorLegend />}
			{showVictory && (
				<Victory
					results={results}
					stats={stats}
					targetName={target.name}
					targetImage={target.image}
				/>
			)}
		</div>
	);
}
