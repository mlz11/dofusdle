import ArrowIcon from "./ArrowIcon";
import styles from "./ColorLegend.module.css";

export default function ColorLegend() {
	return (
		<div className={styles.legend}>
			<div className={styles.items}>
				<span className={styles.item}>
					<span className={`${styles.swatch} cell-correct`} />
					Exact
				</span>
				<span className={styles.item}>
					<span className={`${styles.swatch} cell-partial`} />
					Proche
				</span>
				<span className={styles.item}>
					<span className={`${styles.swatch} cell-wrong`} />
					Mauvais
				</span>
				<span className={styles.item}>
					<span className={styles.arrows}>
						<ArrowIcon direction="up" size={12} decorative />
						<ArrowIcon direction="down" size={12} decorative />
					</span>
					Plus haut / bas
				</span>
			</div>
		</div>
	);
}
