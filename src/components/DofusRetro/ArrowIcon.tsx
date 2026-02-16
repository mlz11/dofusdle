import type { ArrowDirection } from "../../types";
import styles from "./ArrowIcon.module.css";

interface Props {
	direction: ArrowDirection;
	size?: number;
	decorative?: boolean;
}

export default function ArrowIcon({
	direction,
	size = 14,
	decorative = false,
}: Props) {
	if (!direction) return null;
	const rotation = direction === "down" ? 180 : 0;
	const label = direction === "up" ? "Plus haut" : "Plus bas";
	if (decorative) {
		return (
			<svg
				className={styles.icon}
				width={size}
				height={size}
				viewBox="0 0 24 24"
				fill="none"
				style={{ transform: `rotate(${rotation}deg)` }}
				aria-hidden="true"
			>
				<path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor" />
			</svg>
		);
	}
	return (
		<svg
			className={styles.icon}
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			style={{ transform: `rotate(${rotation}deg)` }}
			role="img"
			aria-label={label}
		>
			<title>{label}</title>
			<path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor" />
		</svg>
	);
}
