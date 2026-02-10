import type { GuessResult } from "../../types";
import AttributeCell from "./AttributeCell";

interface Props {
	result: GuessResult;
	isNew?: boolean;
}

export default function GuessRow({ result, isNew }: Props) {
	return (
		<div className="guess-row">
			<div
				className={`guess-monster-name ${isNew ? "cell-flip" : ""}`}
				style={isNew ? { animationDelay: "0ms" } : undefined}
			>
				{result.monster.image && (
					<img
						src={result.monster.image}
						alt=""
						className="guess-monster-img"
					/>
				)}
				<span>{result.monster.name}</span>
			</div>
			<div className="guess-cells">
				<AttributeCell
					label="Écosystème"
					feedback={result.feedback.ecosystem}
					isNew={isNew}
					index={1}
				/>
				<AttributeCell
					label="Race"
					feedback={result.feedback.race}
					isNew={isNew}
					index={2}
				/>
				<AttributeCell
					label="Couleur"
					feedback={result.feedback.couleur}
					isNew={isNew}
					index={3}
				/>
				<AttributeCell
					label="Niveau"
					feedback={result.feedback.niveau}
					isNew={isNew}
					index={4}
				/>
				<AttributeCell
					label="PV"
					feedback={result.feedback.pv}
					isNew={isNew}
					index={5}
				/>
			</div>
		</div>
	);
}
