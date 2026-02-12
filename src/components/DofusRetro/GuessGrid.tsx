import { useMemo } from "react";
import type { GuessResult } from "../../types";
import GuessRow from "./GuessRow";

interface Props {
	results: GuessResult[];
	animatingRowIndex?: number;
}

export default function GuessGrid({ results, animatingRowIndex = -1 }: Props) {
	const reversedResults = useMemo(() => [...results].reverse(), [results]);

	if (results.length === 0) return null;

	return (
		<div className="guess-grid">
			<div className="guess-grid-header">
				<div className="guess-monster-name header-label">Monstre</div>
				<div className="guess-cells">
					<div className="header-cell">Écosystème</div>
					<div className="header-cell">Race</div>
					<div className="header-cell">Couleur</div>
					<div className="header-cell">Niveau max</div>
					<div className="header-cell">PV max</div>
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
