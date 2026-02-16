import confetti from "canvas-confetti";
import { useCallback, useEffect, useMemo, useState } from "react";
import monstersData from "../../data/monsters.json";
import type { GameStats, GuessResult, Monster } from "../../types";
import { compareMonsters } from "../../utils/compare";
import {
	getDailyMonster,
	getTodayKey,
	getYesterdayKey,
	getYesterdayMonster,
} from "../../utils/daily";
import {
	loadProgress,
	loadStats,
	loadTargetMonster,
	recordWin,
	saveProgress,
	saveTargetMonster,
} from "../../utils/storage";
import ColorLegend from "./ColorLegend";
import styles from "./Game.module.css";
import GuessGrid from "./GuessGrid";
import HintPanel from "./HintPanel";
import SearchBar from "./SearchBar";
import Victory from "./Victory";
import YesterdayAnswer from "./YesterdayAnswer";

const monsters: Monster[] = monstersData as Monster[];

/** Delay before first confetti burst (after last cell finishes flipping). */
const CONFETTI_FIRST_MS = 1200;
/** Delay before second, smaller confetti burst. */
const CONFETTI_SECOND_MS = 1700;
/** Delay before showing the victory modal. */
const VICTORY_MODAL_DELAY_MS = 2000;

interface Props {
	stats: GameStats;
	onStatsChange: (stats: GameStats) => void;
}

export default function Game({ stats, onStatsChange }: Props) {
	const [dateKey, setDateKey] = useState(getTodayKey);
	const [target, setTarget] = useState(() => getDailyMonster(monsters));
	const yesterdayKey = getYesterdayKey();
	const yesterdayMonster = useMemo(() => {
		const cachedId = loadTargetMonster(yesterdayKey);
		if (cachedId !== null) {
			const found = monsters.find((m) => m.id === cachedId);
			if (found) return found;
		}
		return getYesterdayMonster(monsters);
	}, [yesterdayKey]);
	const [devMode, setDevMode] = useState(false);

	const [results, setResults] = useState<GuessResult[]>([]);
	const [won, setWon] = useState(false);
	const [showVictory, setShowVictory] = useState(false);
	const [victoryShownOnce, setVictoryShownOnce] = useState(false);
	const [animatingRowIndex, setAnimatingRowIndex] = useState(-1);
	const [hints, setHints] = useState({ hint1: false, hint2: false });

	const resetForNewDay = useCallback((newKey: string) => {
		setDateKey(newKey);
		setTarget(getDailyMonster(monsters, newKey));
		setResults([]);
		setWon(false);
		setShowVictory(false);
		setVictoryShownOnce(false);
		setAnimatingRowIndex(-1);
		setHints({ hint1: false, hint2: false });
	}, []);

	// Reset game when the Paris day changes while the tab is in the background
	useEffect(() => {
		function checkDayChange() {
			if (document.visibilityState !== "visible") return;
			const currentKey = getTodayKey();
			if (currentKey !== dateKey) {
				resetForNewDay(currentKey);
			}
		}
		document.addEventListener("visibilitychange", checkDayChange);
		return () =>
			document.removeEventListener("visibilitychange", checkDayChange);
	}, [dateKey, resetForNewDay]);

	// Cache today's target so tomorrow we can show "yesterday's answer" even if the pool changes
	useEffect(() => {
		if (!devMode) {
			saveTargetMonster(dateKey, target.id);
		}
	}, [dateKey, target, devMode]);

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
			setHints({
				hint1: progress.hint1Revealed ?? false,
				hint2: progress.hint2Revealed ?? false,
			});
			if (progress.won) {
				setShowVictory(true);
				setVictoryShownOnce(true);
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
		setVictoryShownOnce(false);
		setAnimatingRowIndex(-1);
		setHints({ hint1: false, hint2: false });
	}

	const usedIds = useMemo(
		() => new Set(results.map((r) => r.monster.id)),
		[results],
	);

	function handleGuess(monster: Monster) {
		const currentKey = getTodayKey();
		if (currentKey !== dateKey) {
			resetForNewDay(currentKey);
			return;
		}
		if (won || usedIds.has(monster.id)) return;

		const result = compareMonsters(monster, target);
		const newResults = [...results, result];
		setResults(newResults);
		setAnimatingRowIndex(newResults.length - 1);

		const isWin = monster.id === target.id;
		if (isWin) {
			setWon(true);
			const newStats = recordWin(newResults.length);
			onStatsChange(newStats);
			setTimeout(() => {
				confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
			}, CONFETTI_FIRST_MS);
			setTimeout(() => {
				confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
			}, CONFETTI_SECOND_MS);
			setTimeout(() => {
				setShowVictory(true);
				setVictoryShownOnce(true);
			}, VICTORY_MODAL_DELAY_MS);
		}

		if (!devMode) {
			saveProgress(
				newResults.map((r) => r.monster.name),
				isWin,
				hints.hint1,
				hints.hint2,
			);
		}
	}

	const hintsUsed = (hints.hint1 ? 1 : 0) + (hints.hint2 ? 1 : 0);

	function handleRevealHint1() {
		setHints((h) => ({ ...h, hint1: true }));
		if (!devMode) {
			saveProgress(
				results.map((r) => r.monster.name),
				won,
				true,
				hints.hint2,
			);
		}
	}

	function handleRevealHint2() {
		setHints((h) => ({ ...h, hint2: true }));
		if (!devMode) {
			saveProgress(
				results.map((r) => r.monster.name),
				won,
				hints.hint1,
				true,
			);
		}
	}

	return (
		<div className={styles.game}>
			{import.meta.env.DEV && (
				<div className={styles.devToolbar}>
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
			<HintPanel
				guessCount={results.length}
				won={won}
				hint1Revealed={hints.hint1}
				hint2Revealed={hints.hint2}
				targetImage={target.image}
				targetEcosystem={target.ecosystem}
				onRevealHint1={handleRevealHint1}
				onRevealHint2={handleRevealHint2}
			/>
			<SearchBar
				monsters={monsters}
				usedIds={usedIds}
				onSelect={handleGuess}
				disabled={won}
			/>
			<GuessGrid results={results} animatingRowIndex={animatingRowIndex} />
			{results.length > 0 && !won && <ColorLegend />}
			{won && !showVictory && victoryShownOnce && (
				<button
					type="button"
					className={styles.reopenBtn}
					onClick={() => setShowVictory(true)}
				>
					Voir résultats
				</button>
			)}
			<YesterdayAnswer monster={yesterdayMonster} />
			{showVictory && (
				<Victory
					results={results}
					stats={stats}
					targetName={target.name}
					targetImage={target.image}
					hintsUsed={hintsUsed}
					onClose={() => setShowVictory(false)}
				/>
			)}
		</div>
	);
}
