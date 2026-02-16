import { useMemo } from "react";
import type { GuessResult } from "../../types";
import styles from "./GuessGrid.module.css";
import GuessRow from "./GuessRow";

interface Props {
	results: GuessResult[];
	animatingRowIndex?: number;
}

export default function GuessGrid({ results, animatingRowIndex = -1 }: Props) {
	const reversedResults = useMemo(() => [...results].reverse(), [results]);

	if (results.length === 0) return null;

	return (
		<div className={styles.grid}>
			<div className={styles.header}>
				<div className={styles.label}>Monstre</div>
				<div className={styles.cells}>
					<div className={styles.headerCell}>Écosystème</div>
					<div className={styles.headerCell}>Race</div>
					<div className={styles.headerCell}>Couleur</div>
					<div className={styles.headerCell}>Niveau max</div>
					<div className={styles.headerCell}>PV max</div>
				</div>
			</div>
			{reversedResults.map((r, i) => (
				<GuessRow
					key={`${r.monster.id}-${i}`}
					result={r}
					isNew={results.length - 1 - i === animatingRowIndex}
				/>
			))}
		</div>
	);
}
