import type { GuessResult } from "../../types";
import AttributeCell from "./AttributeCell";
import styles from "./GuessRow.module.css";

interface Props {
	result: GuessResult;
	isNew?: boolean;
}

export default function GuessRow({ result, isNew }: Props) {
	return (
		<div className={`${styles.row} ${isNew ? styles.animating : ""}`}>
			<div className={styles.monsterName}>
				{result.monster.image && (
					<img
						src={result.monster.image}
						alt=""
						className={styles.monsterImg}
					/>
				)}
				<span>{result.monster.name}</span>
			</div>
			<div className={styles.cells}>
				<AttributeCell
					label="Écosystème"
					feedback={result.feedback.ecosystem}
				/>
				<AttributeCell label="Race" feedback={result.feedback.race} />
				<AttributeCell label="Couleur" feedback={result.feedback.couleur} />
				<AttributeCell label="Niveau max" feedback={result.feedback.niveau} />
				<AttributeCell label="PV max" feedback={result.feedback.pv} />
			</div>
		</div>
	);
}
