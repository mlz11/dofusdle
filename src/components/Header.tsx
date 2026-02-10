import { useState } from "react";

export default function Header() {
	const [showRules, setShowRules] = useState(false);

	return (
		<header className="app-header">
			<div className="header-content">
				<h1 className="header-title">
					<img
						src="/images/logo.webp"
						alt="Ankamadle"
						className="header-logo"
					/>
				</h1>
				<button
					type="button"
					className="rules-btn"
					onClick={() => setShowRules((v) => !v)}
				>
					?
				</button>
			</div>
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
								<span className="legend-partial">🟧 Orange</span> — Proche (même
								région, niveau ±10, PV ±20%)
							</li>
							<li>
								<span className="legend-wrong">🟥 Rouge</span> — Pas de
								correspondance
							</li>
							<li>⬆️⬇️ — Le vrai monstre est plus haut / plus bas</li>
						</ul>
						<p>
							Les 5 attributs : <strong>Type</strong>, <strong>Zone</strong>,{" "}
							<strong>Niveau</strong>, <strong>Couleur</strong>,{" "}
							<strong>PV</strong>
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
