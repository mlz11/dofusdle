import { useEffect, useState } from "react";
import type { Monster } from "../../types";
import styles from "./YesterdayAnswer.module.css";

interface Props {
	monster: Monster;
}

export default function YesterdayAnswer({ monster }: Props) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

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
