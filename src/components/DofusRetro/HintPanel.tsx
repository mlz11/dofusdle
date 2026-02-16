import { useEffect, useRef, useState } from "react";
import styles from "./HintPanel.module.css";

function BlurredImage({ src }: { src: string }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		const img = new Image();
		img.onload = () => {
			const padding = canvas.width * 0.1;
			ctx.drawImage(
				img,
				padding,
				padding,
				canvas.width - padding * 2,
				canvas.height - padding * 2,
			);
		};
		img.src = src;
	}, [src]);

	return (
		<canvas
			ref={canvasRef}
			width={110}
			height={110}
			className={styles.blurredImage}
			role="img"
			aria-label="Indice visuel"
		/>
	);
}

interface Props {
	guessCount: number;
	won: boolean;
	hint1Revealed: boolean;
	hint2Revealed: boolean;
	targetImage?: string;
	targetEcosystem: string;
	onRevealHint1: () => void;
	onRevealHint2: () => void;
}

const HINT1_THRESHOLD = 5;
const HINT2_THRESHOLD = 8;
const FLIP_OUT_MS = 300;

export default function HintPanel({
	guessCount,
	won,
	hint1Revealed,
	hint2Revealed,
	targetImage,
	targetEcosystem,
	onRevealHint1,
	onRevealHint2,
}: Props) {
	const [flipping1, setFlipping1] = useState(false);
	const [flipping2, setFlipping2] = useState(false);
	const [justRevealed1, setJustRevealed1] = useState(false);
	const [justRevealed2, setJustRevealed2] = useState(false);

	if (won) return null;

	const hint1Unlocked = guessCount >= HINT1_THRESHOLD;
	const hint2Unlocked = guessCount >= HINT2_THRESHOLD;
	const hint1Remaining = HINT1_THRESHOLD - guessCount;
	const hint2Remaining = HINT2_THRESHOLD - guessCount;

	function handleFlipHint1() {
		setFlipping1(true);
		setTimeout(() => {
			setFlipping1(false);
			setJustRevealed1(true);
			onRevealHint1();
		}, FLIP_OUT_MS);
	}

	function handleFlipHint2() {
		setFlipping2(true);
		setTimeout(() => {
			setFlipping2(false);
			setJustRevealed2(true);
			onRevealHint2();
		}, FLIP_OUT_MS);
	}

	return (
		<div className={styles.panel}>
			<h3 className={styles.title}>Indices</h3>
			<div className={styles.slots}>
				{hint1Revealed || justRevealed1 ? (
					<div
						className={`${styles.slot} ${styles.slotRevealed} ${justRevealed1 ? styles.flipIn : ""}`}
						onAnimationEnd={() => setJustRevealed1(false)}
					>
						{targetImage ? (
							<div className={styles.blurredContainer}>
								<BlurredImage src={targetImage} />
							</div>
						) : (
							<span className={styles.slotLabel}>Aucune image</span>
						)}
						<span className={styles.slotLabel}>Image floue</span>
					</div>
				) : hint1Unlocked ? (
					<button
						type="button"
						className={`${styles.slot} ${styles.slotUnlocked} ${flipping1 ? styles.flipOut : ""}`}
						onClick={handleFlipHint1}
						disabled={flipping1}
					>
						<svg
							aria-hidden="true"
							className={styles.icon}
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<path d="M21 15l-5-5L5 21" />
						</svg>
						<span className={styles.slotLabel}>Image floue</span>
						<span className={styles.action}>Cliquer pour révéler</span>
					</button>
				) : (
					<div className={`${styles.slot} ${styles.slotLocked}`}>
						<svg
							aria-hidden="true"
							className={styles.icon}
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
						<span className={styles.slotLabel}>Image floue</span>
						<span className={styles.remaining}>
							dans {hint1Remaining} essai{hint1Remaining > 1 ? "s" : ""}
						</span>
					</div>
				)}

				{hint2Revealed || justRevealed2 ? (
					<div
						className={`${styles.slot} ${styles.slotRevealed} ${justRevealed2 ? styles.flipIn : ""}`}
						onAnimationEnd={() => setJustRevealed2(false)}
					>
						<span className={styles.slotValue}>{targetEcosystem}</span>
						<span className={styles.slotLabel}>Ecosystème</span>
					</div>
				) : hint2Unlocked ? (
					<button
						type="button"
						className={`${styles.slot} ${styles.slotUnlocked} ${flipping2 ? styles.flipOut : ""}`}
						onClick={handleFlipHint2}
						disabled={flipping2}
					>
						<svg
							aria-hidden="true"
							className={styles.icon}
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="M2 12h20" />
							<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
						</svg>
						<span className={styles.slotLabel}>Ecosystème</span>
						<span className={styles.action}>Cliquer pour révéler</span>
					</button>
				) : (
					<div className={`${styles.slot} ${styles.slotLocked}`}>
						<svg
							aria-hidden="true"
							className={styles.icon}
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
							<path d="M7 11V7a5 5 0 0 1 10 0v4" />
						</svg>
						<span className={styles.slotLabel}>Ecosystème</span>
						<span className={styles.remaining}>
							dans {hint2Remaining} essai{hint2Remaining > 1 ? "s" : ""}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
