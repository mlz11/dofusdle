import { useState } from "react";
import type { GameStats } from "../types";
import { loadStats } from "../utils/storage";
import styles from "./App.module.css";
import Game from "./DofusRetro/Game";
import Footer from "./Footer";
import Header from "./Header";

export default function App() {
	const [stats, setStats] = useState<GameStats>(loadStats);

	return (
		<div className={styles.app}>
			<Header stats={stats} />
			<main>
				<Game stats={stats} onStatsChange={setStats} />
			</main>
			<Footer />
		</div>
	);
}
