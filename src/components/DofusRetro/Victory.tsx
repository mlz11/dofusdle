import { useEffect, useState } from "react";
import type { GameStats, GuessResult } from "../../types";

function getTimeUntilMidnight(): string {
	const now = new Date();
	const midnight = new Date(now);
	midnight.setHours(24, 0, 0, 0);
	const diff = midnight.getTime() - now.getTime();
	const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
	const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
	const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0");
	return `${h}:${m}:${s}`;
}

interface Props {
	results: GuessResult[];
	stats: GameStats;
	targetName: string;
}

function buildShareText(results: GuessResult[], targetName: string): string {
	const header = `Ankamadle - ${targetName} en ${results.length} essai${results.length > 1 ? "s" : ""}`;
	const grid = results
		.map((r) => {
			const cells = [
				r.feedback.ecosystem,
				r.feedback.race,
				r.feedback.couleur,
				r.feedback.niveau,
				r.feedback.pv,
			];
			return cells
				.map((c) => {
					if (c.status === "correct") return "🟩";
					if (c.status === "partial") return "🟧";
					return "🟥";
				})
				.join("");
		})
		.join("\n");
	return `${header}\n${grid}`;
}

export default function Victory({ results, stats, targetName }: Props) {
	const [copied, setCopied] = useState(false);
	const [countdown, setCountdown] = useState(getTimeUntilMidnight);

	useEffect(() => {
		const id = setInterval(() => setCountdown(getTimeUntilMidnight()), 1_000);
		return () => clearInterval(id);
	}, []);

	function handleShare() {
		const text = buildShareText(results, targetName);
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	const winPct =
		stats.gamesPlayed > 0
			? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
			: 0;

	return (
		<div className="victory-overlay">
			<div className="victory-modal">
				<h2>Bravo !</h2>
				<p>
					Tu as trouvé <strong>{targetName}</strong> en{" "}
					<strong>{results.length}</strong> essai{results.length > 1 ? "s" : ""}
					.
				</p>

				<div className="stats-grid">
					<div className="stat">
						<span className="stat-value">{stats.gamesPlayed}</span>
						<span className="stat-label">Parties</span>
					</div>
					<div className="stat">
						<span className="stat-value">{winPct}%</span>
						<span className="stat-label">Victoires</span>
					</div>
					<div className="stat">
						<span className="stat-value">{stats.currentStreak}</span>
						<span className="stat-label">Série</span>
					</div>
					<div className="stat">
						<span className="stat-value">{stats.maxStreak}</span>
						<span className="stat-label">Max série</span>
					</div>
				</div>

				<div className="countdown">
					<span className="countdown-label">Prochain monstre dans</span>
					<span className="countdown-timer">{countdown}</span>
				</div>

				<button type="button" className="share-btn" onClick={handleShare}>
					{copied ? "Copié !" : "Partager"}
				</button>
			</div>
		</div>
	);
}
