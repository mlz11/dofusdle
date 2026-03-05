interface Props {
	isMuted: boolean;
	onToggle: () => void;
	className?: string;
}

export default function MuteButton({ isMuted, onToggle, className }: Props) {
	return (
		<button
			type="button"
			className={className}
			onClick={onToggle}
			aria-label={isMuted ? "Activer la musique" : "Couper la musique"}
		>
			<svg
				width="26"
				height="26"
				viewBox="0 0 24 24"
				fill="currentColor"
				aria-hidden="true"
			>
				{isMuted ? (
					<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.1v1.55l2.22 2.22a3.02 3.02 0 0 0 .28-1.87zM14 3.23v2.06a6.51 6.51 0 0 1 4 6.21 6.44 6.44 0 0 1-.69 2.9l1.46 1.46A8.43 8.43 0 0 0 20 11.5a8.5 8.5 0 0 0-6-8.14v-.13zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.46 8.46 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z" />
				) : (
					<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.1v7.8a4.47 4.47 0 0 0 2.5-3.9zM14 3.23v2.06a6.51 6.51 0 0 1 0 13.42v2.06A8.5 8.5 0 0 0 20 12.5v-1a8.5 8.5 0 0 0-6-8.14v-.13z" />
				)}
			</svg>
		</button>
	);
}
