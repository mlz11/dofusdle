import type { Monster } from "../../types";
import styles from "./YesterdayAnswer.module.css";

interface Props {
	monster: Monster;
}

export default function YesterdayAnswer({ monster }: Props) {
	return (
		<div className={styles.answer}>
			{monster.image && (
				<img className={styles.img} src={monster.image} alt={monster.name} />
			)}
			<p>
				Le monstre d'hier était <strong>{monster.name}</strong>
			</p>
		</div>
	);
}
