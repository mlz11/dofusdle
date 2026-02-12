import { useCallback, useRef, useState } from "react";
import { useCloseOnKey } from "../hooks/useCloseOnKey";

const CLOSE_KEYS = ["Escape", "Enter"];

export default function Footer() {
	const [showInfo, setShowInfo] = useState(false);
	const btnRef = useRef<HTMLButtonElement>(null);

	const closeInfo = useCallback(() => {
		setShowInfo(false);
		btnRef.current?.blur();
	}, []);

	useCloseOnKey(showInfo, closeInfo, CLOSE_KEYS);

	return (
		<footer className="app-footer">
			<button
				ref={btnRef}
				type="button"
				className="footer-info-btn"
				onClick={() => setShowInfo((v) => !v)}
			>
				À propos / Mentions légales
			</button>
			{showInfo && (
				<div
					className="rules-overlay"
					onClick={(e) => {
						if (e.target === e.currentTarget) setShowInfo(false);
					}}
					onKeyDown={(e) => {
						if (e.key === "Escape") setShowInfo(false);
					}}
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-label="À propos"
						className="rules-modal"
					>
						<h2>À propos</h2>
						<p>
							Dofus est un jeu édité par <strong>Ankama Games</strong>. Toutes
							les images, noms de monstres et données de jeu sont la propriété
							d'Ankama. Ce site n'est ni affilié, ni approuvé par Ankama.
						</p>
						<p>
							Données issues de{" "}
							<a
								href="https://solomonk.fr/"
								target="_blank"
								rel="noopener noreferrer"
							>
								solomonk.fr
							</a>{" "}
							et{" "}
							<a
								href="https://wiki-dofus.eu/"
								target="_blank"
								rel="noopener noreferrer"
							>
								wiki-dofus.eu
							</a>
							. Inspiré de{" "}
							<a
								href="https://www.nytimes.com/games/wordle"
								target="_blank"
								rel="noopener noreferrer"
							>
								Wordle
							</a>{" "}
							et{" "}
							<a
								href="https://loldle.net/"
								target="_blank"
								rel="noopener noreferrer"
							>
								LoLdle
							</a>
							.
						</p>
						<button
							type="button"
							className="rules-close-btn"
							onClick={() => setShowInfo(false)}
						>
							Fermer
						</button>
					</div>
				</div>
			)}
		</footer>
	);
}
