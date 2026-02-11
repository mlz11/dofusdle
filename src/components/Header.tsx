import { useEffect, useRef, useState } from "react";
import type { GameStats } from "../types";

interface Props {
	stats: GameStats;
}

export default function Header({ stats }: Props) {
	const [showRules, setShowRules] = useState(false);
	const [showStats, setShowStats] = useState(false);
	const rulesBtnRef = useRef<HTMLButtonElement>(null);
	const statsBtnRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!showRules && !showStats) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape" || e.key === "Enter") {
				if (showRules) {
					setShowRules(false);
					rulesBtnRef.current?.blur();
				}
				if (showStats) {
					setShowStats(false);
					statsBtnRef.current?.blur();
				}
			}
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [showRules, showStats]);

	const winPct =
		stats.gamesPlayed > 0
			? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
			: 0;

	return (
		<header className="app-header">
			<h1 className="header-title">
				<img src="/images/logo.webp" alt="Ankamadle" className="header-logo" />
			</h1>
			<p className="game-subtitle">
				Dofus Retro 1.29 — Devine le monstre du jour
			</p>
			<nav className="toolbar">
				<button
					ref={statsBtnRef}
					type="button"
					className="toolbar-btn"
					onClick={() => setShowStats((v) => !v)}
					aria-label="Statistiques"
				>
					<svg
						width="26"
						height="26"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<rect
							x="4"
							y="14"
							width="4"
							height="8"
							rx="1"
							fill="currentColor"
						/>
						<rect
							x="10"
							y="8"
							width="4"
							height="14"
							rx="1"
							fill="currentColor"
						/>
						<rect
							x="16"
							y="2"
							width="4"
							height="20"
							rx="1"
							fill="currentColor"
						/>
					</svg>
				</button>
				<div className="toolbar-streak">
					<svg
						width="34"
						height="34"
						viewBox="0 0 16 16"
						fill="var(--accent)"
						aria-hidden="true"
					>
						<path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16" />
						<text
							x="8"
							y="13.5"
							textAnchor="middle"
							fill="#fff"
							fontSize="6.5"
							fontWeight="800"
						>
							{stats.currentStreak}
						</text>
					</svg>
				</div>
				<button
					ref={rulesBtnRef}
					type="button"
					className="toolbar-btn"
					onClick={() => setShowRules((v) => !v)}
					aria-label="Règles"
				>
					<svg
						width="26"
						height="26"
						viewBox="0 0 24 24"
						fill="none"
						aria-hidden="true"
					>
						<circle
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="2"
						/>
						<text
							x="12"
							y="17"
							textAnchor="middle"
							fill="currentColor"
							fontSize="14"
							fontWeight="700"
						>
							?
						</text>
					</svg>
				</button>
			</nav>
			{showStats && (
				<div
					role="presentation"
					className="rules-overlay"
					onClick={() => setShowStats(false)}
				>
					<div
						role="presentation"
						className="rules-modal stats-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<h2>Statistiques</h2>
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
						<button
							type="button"
							className="rules-close-btn"
							onClick={() => setShowStats(false)}
						>
							Fermer
						</button>
					</div>
				</div>
			)}
			{showRules && (
				<div
					role="presentation"
					className="rules-overlay"
					onClick={() => setShowRules(false)}
				>
					<div
						role="presentation"
						className="rules-modal"
						onClick={(e) => e.stopPropagation()}
					>
						<h2>Comment jouer</h2>
						<p>
							Trouve le monstre Dofus Retro du jour en devinant ses attributs.
						</p>
						<ul>
							<li>
								<span className="legend-correct">🟩 Vert</span> — Attribut exact
							</li>
							<li>
								<span className="legend-partial">🟧 Orange</span> — Proche
								(plages qui se chevauchent)
							</li>
							<li>
								<span className="legend-wrong">🟥 Rouge</span> — Pas de
								correspondance
							</li>
							<li>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									style={{ verticalAlign: "middle" }}
									aria-hidden="true"
								>
									<path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor" />
								</svg>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									style={{
										verticalAlign: "middle",
										transform: "rotate(180deg)",
									}}
									aria-hidden="true"
								>
									<path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor" />
								</svg>{" "}
								— Le vrai monstre est plus haut / plus bas
							</li>
						</ul>
						<p>
							Les 5 attributs : <strong>Écosystème</strong>,{" "}
							<strong>Race</strong>, <strong>Couleur</strong>,{" "}
							<strong>Niveau</strong>, <strong>PV</strong>
						</p>
						<button
							type="button"
							className="rules-close-btn"
							onClick={() => setShowRules(false)}
						>
							Compris !
						</button>
					</div>
				</div>
			)}
		</header>
	);
}
