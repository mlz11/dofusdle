import { useEffect, useState } from "react";
import { useCloseOnKey } from "../../hooks/useCloseOnKey";
import statsGridStyles from "../../styles/StatsGrid.module.css";
import type { GameStats, GuessResult } from "../../types";
import { getWinPercentage } from "../../utils/storage";
import styles from "./Victory.module.css";

function getTimeUntilMidnightParis(): string {
	const now = new Date();
	const parisNow = new Date(
		now.toLocaleString("en-US", { timeZone: "Europe/Paris" }),
	);
	const midnightParis = new Date(parisNow);
	midnightParis.setHours(24, 0, 0, 0);
	const diff = midnightParis.getTime() - parisNow.getTime();
	const h = String(Math.floor(diff / 3_600_000)).padStart(2, "0");
	const m = String(Math.floor((diff % 3_600_000) / 60_000)).padStart(2, "0");
	const s = String(Math.floor((diff % 60_000) / 1_000)).padStart(2, "0");
	return `${h}:${m}:${s}`;
}

interface Props {
	results: GuessResult[];
	stats: GameStats;
	targetName: string;
	targetImage?: string;
	hintsUsed: number;
	onClose: () => void;
}

function buildShareText(results: GuessResult[], hintsUsed: number): string {
	const hintSuffix =
		hintsUsed > 0 ? ` (+${hintsUsed} indice${hintsUsed > 1 ? "s" : ""})` : "";
	const header = `Dofusdle - J'ai trouvé la réponse en ${results.length} essai${results.length > 1 ? "s" : ""}${hintSuffix}`;
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
	return `${header}\n${grid}\nhttps://dofusdle.fr`;
}

export default function Victory({
	results,
	stats,
	targetName,
	targetImage,
	hintsUsed,
	onClose,
}: Props) {
	const [copied, setCopied] = useState(false);
	const [countdown, setCountdown] = useState(getTimeUntilMidnightParis);

	useEffect(() => {
		const id = setInterval(
			() => setCountdown(getTimeUntilMidnightParis()),
			1_000,
		);
		return () => clearInterval(id);
	}, []);

	useCloseOnKey(true, onClose);

	function handleShare() {
		const text = buildShareText(results, hintsUsed);
		navigator.clipboard.writeText(text).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	const winPct = getWinPercentage(stats);

	return (
		<div className={styles.overlay} onClick={onClose} onKeyDown={() => {}}>
			<div
				className={styles.modal}
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					className={styles.closeBtn}
					onClick={onClose}
					aria-label="Fermer"
				>
					&#x2715;
				</button>
				<h2>Bravo !</h2>
				{targetImage && (
					<img
						src={targetImage}
						alt={targetName}
						className={styles.monsterImg}
					/>
				)}
				<p>
					Tu as trouvé <strong>{targetName}</strong> en{" "}
					<strong>{results.length}</strong> essai{results.length > 1 ? "s" : ""}
					.
				</p>

				<div className={statsGridStyles.grid}>
					<div className={statsGridStyles.stat}>
						<span className={statsGridStyles.value}>{stats.gamesPlayed}</span>
						<span className={statsGridStyles.label}>Parties</span>
					</div>
					<div className={statsGridStyles.stat}>
						<span className={statsGridStyles.value}>{winPct}%</span>
						<span className={statsGridStyles.label}>Victoires</span>
					</div>
					<div className={statsGridStyles.stat}>
						<span className={statsGridStyles.value}>{stats.currentStreak}</span>
						<span className={statsGridStyles.label}>Série</span>
					</div>
					<div className={statsGridStyles.stat}>
						<span className={statsGridStyles.value}>{stats.maxStreak}</span>
						<span className={statsGridStyles.label}>Max série</span>
					</div>
				</div>

				<div className={styles.countdown}>
					<span className={styles.label}>Prochain monstre dans</span>
					<span className={styles.timer}>{countdown}</span>
				</div>

				<button type="button" className={styles.shareBtn} onClick={handleShare}>
					{copied ? "Copié !" : "Partager"}
				</button>
			</div>
		</div>
	);
}
