import type { AttributeFeedback } from "../../types";
import ArrowIcon from "./ArrowIcon";
import styles from "./AttributeCell.module.css";

interface Props {
	label: string;
	feedback: AttributeFeedback;
}

const STATUS_CLASS: Record<string, string> = {
	correct: "cell-correct",
	partial: "cell-partial",
	wrong: "cell-wrong",
};

export default function AttributeCell({ label, feedback }: Props) {
	return (
		<div
			className={`attribute-cell ${styles.cell} ${STATUS_CLASS[feedback.status]}`}
		>
			<span className={styles.label}>{label}</span>
			<span className={styles.value}>
				{feedback.value}
				<ArrowIcon direction={feedback.arrow} />
			</span>
		</div>
	);
}
