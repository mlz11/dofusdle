import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useMusic } from "../hooks/useMusic";
import type { GameMode, GameStats } from "../types";
import { defaultStats, loadStats } from "../utils/storage";
import styles from "./App.module.css";
import ClassiqueGame from "./DofusRetro/Game";
import ErrorBoundary from "./ErrorBoundary";
import Footer from "./Footer";
import Header from "./Header";
import HomePage from "./HomePage";
import SilhouetteGame from "./Silhouette/Game";

function FallbackUI() {
	return (
		<div className={styles.app}>
			<p>Une erreur est survenue. Veuillez rafraîchir la page.</p>
		</div>
	);
}

const MODE_BY_PATH: Record<string, GameMode> = {
	"/classique": "classique",
	"/silhouette": "silhouette",
};

const THEME_CLASSES = Object.entries(MODE_BY_PATH).map(
	([route, mode]) => [route, `theme-${mode}`] as const,
);

function normalizePath(pathname: string): string {
	return pathname.length > 1 && pathname.endsWith("/")
		? pathname.slice(0, -1)
		: pathname;
}

function AppContent() {
	const location = useLocation();
	const path = normalizePath(location.pathname);
	const activeMode = MODE_BY_PATH[path] ?? null;
	const { isMuted, toggle: onMuteToggle } = useMusic();

	useLayoutEffect(() => {
		for (const [route, cls] of THEME_CLASSES) {
			document.body.classList.toggle(cls, path === route);
		}
		return () => {
			for (const [, cls] of THEME_CLASSES) {
				document.body.classList.remove(cls);
			}
		};
	}, [path]);

	const [statsByMode, setStatsByMode] = useState<Record<GameMode, GameStats>>({
		classique: defaultStats(),
		silhouette: defaultStats(),
	});

	useEffect(() => {
		setStatsByMode({
			classique: loadStats("classique"),
			silhouette: loadStats("silhouette"),
		});
	}, []);

	const handleStatsChange = useCallback((mode: GameMode, stats: GameStats) => {
		setStatsByMode((prev) => ({ ...prev, [mode]: stats }));
	}, []);

	const handleClassiqueStatsChange = useCallback(
		(s: GameStats) => handleStatsChange("classique", s),
		[handleStatsChange],
	);

	const handleSilhouetteStatsChange = useCallback(
		(s: GameStats) => handleStatsChange("silhouette", s),
		[handleStatsChange],
	);

	return (
		<div className={styles.app}>
			<Header
				stats={activeMode ? statsByMode[activeMode] : statsByMode.classique}
				gameMode={activeMode}
				isMuted={isMuted}
				onMuteToggle={onMuteToggle}
			/>
			<main>
				<Routes>
					<Route
						path="/"
						element={<HomePage isMuted={isMuted} onMuteToggle={onMuteToggle} />}
					/>
					<Route
						path="/classique"
						element={
							<ClassiqueGame
								gameMode="classique"
								stats={statsByMode.classique}
								onStatsChange={handleClassiqueStatsChange}
							/>
						}
					/>
					<Route
						path="/silhouette"
						element={
							<SilhouetteGame
								gameMode="silhouette"
								stats={statsByMode.silhouette}
								onStatsChange={handleSilhouetteStatsChange}
							/>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</main>
			<Footer />
		</div>
	);
}

export default function App() {
	return (
		<ErrorBoundary fallback={<FallbackUI />}>
			<AppContent />
		</ErrorBoundary>
	);
}
