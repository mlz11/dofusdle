import { useState } from "react";
import type { GameStats } from "../types";
import { loadStats } from "../utils/storage";
import Game from "./DofusRetro/Game";
import Header from "./Header";

export default function App() {
	const [stats, setStats] = useState<GameStats>(loadStats);

	return (
		<div className="app">
			<Header stats={stats} />
			<main>
				<Game stats={stats} onStatsChange={setStats} />
			</main>
		</div>
	);
}
