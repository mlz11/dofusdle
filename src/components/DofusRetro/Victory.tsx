import { usePostHog } from "@posthog/react";
import { useEffect, useState } from "react";
import { useCloseOnKey } from "../../hooks/useCloseOnKey";
import statsGridStyles from "../../styles/StatsGrid.module.css";
import type { GameStats, GuessResult } from "../../types";
import { getWinPercentage } from "../../utils/storage";
import { getTimeUntilMidnightParis } from "../../utils/time";
import styles from "./Victory.module.css";

interface Props {
	results: GuessResult[];
	stats: GameStats;
	targetName: string;
	targetImage: string;
	hintsUsed: number;
	onClose: () => void;
}

const COLLAPSE_THRESHOLD = 12;
const VISIBLE_ROWS = 3;

function buildShareText(results: GuessResult[], hintsUsed: number): string {
	const hintSuffix =
		hintsUsed > 0 ? ` (+${hintsUsed} indice${hintsUsed > 1 ? "s" : ""})` : "";
	const header = `Dofusdle - J'ai trouvé la réponse en ${results.length} essai${results.length > 1 ? "s" : ""}${hintSuffix}`;
	const rows = results.map((r) => {
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
	});

	let grid: string;
	if (rows.length > COLLAPSE_THRESHOLD) {
		const hidden = rows.length - VISIBLE_ROWS * 2;
		grid = [
			...rows.slice(0, VISIBLE_ROWS),
			`   ⋮ (${hidden} de plus)`,
			...rows.slice(-VISIBLE_ROWS),
		].join("\n");
	} else {
		grid = rows.join("\n");
	}

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
	const posthog = usePostHog();
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
		posthog?.capture("result_shared", {
			game_mode: "classique",
			guess_count: results.length,
			hints_used: hintsUsed,
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
