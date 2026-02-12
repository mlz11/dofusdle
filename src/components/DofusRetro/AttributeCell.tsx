import type { AttributeFeedback } from "../../types";
import ArrowIcon from "./ArrowIcon";

interface Props {
	label: string;
	feedback: AttributeFeedback;
	isNew?: boolean;
	index?: number;
}

const STATUS_CLASS: Record<string, string> = {
	correct: "cell-correct",
	partial: "cell-partial",
	wrong: "cell-wrong",
};

export default function AttributeCell({
	label,
	feedback,
	isNew,
	index = 0,
}: Props) {
	return (
		<div
			className={`attribute-cell ${STATUS_CLASS[feedback.status]} ${isNew ? "cell-flip" : ""}`}
			style={isNew ? { animationDelay: `${index * 200}ms` } : undefined}
		>
			<span className="cell-label">{label}</span>
			<span className="cell-value">
				{feedback.value}
				<ArrowIcon direction={feedback.arrow} />
			</span>
		</div>
	);
}
