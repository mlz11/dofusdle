import { usePostHog } from "@posthog/react";
import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import styles from "./HomePage.module.css";

export default function HomePage() {
	const posthog = usePostHog();

	useDocumentMeta({
		title: "Dofusdle - Le jeu de devinettes Dofus Retro",
		description:
			"Choisis ton mode de jeu Dofusdle ! Devine le monstre Dofus Retro du jour dans différents modes inspirés de Wordle.",
		canonicalUrl: "https://dofusdle.fr/",
	});

	return (
		<div className={styles.page}>
			<div className={styles.taglineBar}>
				<p className={styles.tagline}>Choisis ton mode de jeu</p>
			</div>
			<div className={styles.gridPanel}>
				<div className={styles.grid}>
					<Link
						to="/classique"
						className={`${styles.card} ${styles.cardGreen}`}
						onClick={() =>
							posthog?.capture("game_mode_selected", { mode: "classique" })
						}
					>
						<div className={styles.cardImageContainer}>
							<img
								src="/images/classique.webp"
								width={512}
								height={768}
								loading="lazy"
								alt=""
								className={styles.cardImageLarge}
							/>
							<img
								src="/images/dofus-emeraude.png"
								width={96}
								height={96}
								alt=""
								className={styles.cardImageSmall}
							/>
							<div className={styles.cardOverlay}>
								<span className={styles.cardDescription}>
									Devine le monstre du jour en comparant ses attributs
								</span>
							</div>
							<span className={styles.cardTitle}>Classique</span>
						</div>
						<div className={styles.cardBody}>
							<span className={styles.cardTitleMobile}>Classique</span>
							<span className={styles.cardDescriptionMobile}>
								Devine le monstre du jour en comparant ses attributs
							</span>
						</div>
					</Link>
					<Link
						to="/silhouette"
						className={`${styles.card} ${styles.cardOrange}`}
						onClick={() =>
							posthog?.capture("game_mode_selected", { mode: "silhouette" })
						}
					>
						<div className={styles.cardImageContainer}>
							<img
								src="/images/silhouette.webp"
								width={512}
								height={768}
								loading="lazy"
								alt=""
								className={styles.cardImageLarge}
							/>
							<img
								src="/images/dofus-pourpre.png"
								width={96}
								height={96}
								alt=""
								className={styles.cardImageSmall}
							/>
							<div className={styles.cardOverlay}>
								<span className={styles.cardDescription}>
									Devine le monstre du jour à partir de sa silhouette
								</span>
							</div>
							<span className={styles.cardTitle}>Silhouette</span>
						</div>
						<div className={styles.cardBody}>
							<span className={styles.cardTitleMobile}>Silhouette</span>
							<span className={styles.cardDescriptionMobile}>
								Devine le monstre du jour à partir de sa silhouette
							</span>
						</div>
					</Link>
				</div>
			</div>
		</div>
	);
}
