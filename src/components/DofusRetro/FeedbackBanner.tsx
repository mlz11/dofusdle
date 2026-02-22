import { useEffect } from "react";
import styles from "./FeedbackBanner.module.css";

interface Props {
	visible: boolean;
	onDismiss: () => void;
}

const AUTO_DISMISS_MS = 5_000;

export default function FeedbackBanner({ visible, onDismiss }: Props) {
	useEffect(() => {
		if (!visible) return;
		const id = setTimeout(onDismiss, AUTO_DISMISS_MS);
		return () => clearTimeout(id);
	}, [visible, onDismiss]);

	if (!visible) return null;

	return (
		<div className={styles.banner} role="alert">
			<p className={styles.message}>
				Tous les attributs correspondent, mais ce n'est pas le bon monstre !
			</p>
			<button
				type="button"
				className={styles.closeBtn}
				onClick={onDismiss}
				aria-label="Fermer"
			>
				&#x2715;
			</button>
		</div>
	);
}
