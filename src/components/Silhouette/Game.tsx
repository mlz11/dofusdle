import { usePostHog } from "@posthog/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import monstersData from "../../data/monsters.json";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";
import type { GameMode, GameStats, Monster } from "../../types";
import {
	getDailyMonsterForMode,
	getTodayKey,
	getYesterdayKey,
	getYesterdayMonster,
} from "../../utils/daily";
import {
	clearProgress,
	loadProgress,
	loadStats,
	loadTargetMonster,
	recordWin,
	saveProgress,
	saveTargetMonster,
} from "../../utils/storage";
import { parseMonsters } from "../../validation";
import { useSolveCount } from "../DofusRetro/hooks/useSolveCount";
import { useVictoryModal } from "../DofusRetro/hooks/useVictoryModal";
import SearchBar from "../DofusRetro/SearchBar";
import YesterdayAnswer from "../DofusRetro/YesterdayAnswer";
import styles from "./Game.module.css";
import SilhouetteImage from "./SilhouetteImage";
import SilhouetteVictory from "./SilhouetteVictory";
import WrongGuessList from "./WrongGuessList";

const monsters = parseMonsters(monstersData);

interface Props {
	gameMode: GameMode;
	stats: GameStats;
	onStatsChange: (stats: GameStats) => void;
}

export default function Game({ gameMode, stats, onStatsChange }: Props) {
	useDocumentMeta({
		title: "Dofusdle Silhouette - Devine le monstre Dofus Retro !",
		description:
			"Devine le monstre Dofus Retro du jour à partir de sa silhouette ! Un défi visuel quotidien pour les fans de Dofus 1.29.",
		canonicalUrl: "https://dofusdle.fr/silhouette",
	});

	const [dateKey, setDateKey] = useState(getTodayKey);
	const [target, setTarget] = useState(() =>
		getDailyMonsterForMode(monsters, gameMode),
	);
	const yesterdayKey = getYesterdayKey();
	const yesterdayMonster = useMemo(() => {
		const cachedId = loadTargetMonster(gameMode, yesterdayKey);
		if (cachedId !== null) {
			const found = monsters.find((m) => m.id === cachedId);
			if (found) return found;
		}
		return getYesterdayMonster(monsters, gameMode);
	}, [yesterdayKey, gameMode]);
	const [devMode, setDevMode] = useState(false);

	const [wrongGuesses, setWrongGuesses] = useState<Monster[]>([]);
	const [won, setWon] = useState(false);

	const {
		showVictory,
		victoryShownOnce,
		triggerWin,
		closeVictory,
		reopenVictory,
		showImmediately,
		resetVictory,
	} = useVictoryModal();
	const { count: solveCount, reportSolve } = useSolveCount(dateKey, gameMode);
	const posthog = usePostHog();

	const persistProgress = useCallback(
		(guessNames: string[], hasWon: boolean) => {
			if (devMode) return;
			saveProgress(gameMode, guessNames, hasWon);
		},
		[devMode, gameMode],
	);

	const resetForNewDay = useCallback(
		(newKey: string) => {
			setDateKey(newKey);
			setTarget(getDailyMonsterForMode(monsters, gameMode, newKey));
			setWrongGuesses([]);
			setWon(false);
			resetVictory();
		},
		[gameMode, resetVictory],
	);

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

	useEffect(() => {
		if (!devMode) {
			saveTargetMonster(gameMode, dateKey, target.id);
		}
	}, [dateKey, target, devMode, gameMode]);

	useEffect(() => {
		if (devMode) return;
		const progress = loadProgress(gameMode);
		if (progress) {
			const restoredWrong: Monster[] = [];
			for (const name of progress.guesses) {
				const m = monsters.find((m) => m.name === name);
				if (m && m.id !== target.id) restoredWrong.push(m);
			}
			setWrongGuesses(restoredWrong);
			setWon(progress.won);
			if (progress.won) {
				showImmediately();
				onStatsChange(loadStats(gameMode));
			}
		}
	}, [target, devMode, gameMode, onStatsChange, showImmediately]);

	function selectTarget(monster: Monster) {
		setTarget(monster);
		setWrongGuesses([]);
		setWon(false);
		resetVictory();
		clearProgress(gameMode);
	}

	function resetGame() {
		selectTarget(monsters[Math.floor(Math.random() * monsters.length)]);
	}

	const usedIds = useMemo(
		() =>
			new Set([...wrongGuesses.map((m) => m.id), ...(won ? [target.id] : [])]),
		[wrongGuesses, won, target.id],
	);

	const totalGuesses = wrongGuesses.length + (won ? 1 : 0);

	function handleGuess(monster: Monster) {
		const currentKey = getTodayKey();
		if (currentKey !== dateKey) {
			resetForNewDay(currentKey);
			return;
		}
		if (won || usedIds.has(monster.id)) return;

		const isWin = monster.id === target.id;
		const allGuessNames = [...wrongGuesses.map((m) => m.name), monster.name];

		posthog?.capture("guess_submitted", {
			game_mode: gameMode,
			guess_number: totalGuesses + 1,
			is_correct: isWin,
			monster_guessed: monster.name,
		});

		if (isWin) {
			setWon(true);
			const newStats = recordWin(gameMode, totalGuesses + 1);
			onStatsChange(newStats);
			triggerWin();
			if (!devMode) {
				reportSolve();
			}
			posthog?.capture("game_won", {
				game_mode: gameMode,
				guess_count: totalGuesses + 1,
				monster_name: target.name,
			});
		} else {
			setWrongGuesses((prev) => [...prev, monster]);
		}

		persistProgress(allGuessNames, isWin);
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
							<input
								list="dev-monster-list-silhouette"
								placeholder="Choose monster..."
								onChange={(e) => {
									const found = monsters.find((m) => m.name === e.target.value);
									if (found) {
										selectTarget(found);
										e.target.value = "";
									}
								}}
							/>
							<datalist id="dev-monster-list-silhouette">
								{monsters.map((m) => (
									<option key={m.id} value={m.name} />
								))}
							</datalist>
						</>
					)}
				</div>
			)}
			<SilhouetteImage src={target.image} revealed={won} />
			{solveCount !== null && solveCount > 0 && (
				<p className={styles.guessCounter}>
					{solveCount} joueur{solveCount !== 1 ? "s" : ""}{" "}
					{solveCount !== 1 ? "ont" : "a"} déjà trouvé !
				</p>
			)}
			<SearchBar
				monsters={monsters}
				usedIds={usedIds}
				onSelect={handleGuess}
				disabled={won}
			/>
			<WrongGuessList
				guesses={wrongGuesses}
				winner={won ? target : undefined}
			/>
			{won && !showVictory && victoryShownOnce && (
				<button
					type="button"
					className={styles.reopenBtn}
					onClick={reopenVictory}
				>
					Voir résultats
				</button>
			)}
			<YesterdayAnswer monster={yesterdayMonster} />
			{showVictory && (
				<SilhouetteVictory
					guessCount={totalGuesses}
					stats={stats}
					targetName={target.name}
					targetImage={target.image}
					onClose={closeVictory}
				/>
			)}
		</div>
	);
}
