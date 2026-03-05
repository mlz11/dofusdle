import { Volume2, VolumeOff } from "lucide-react";

interface Props {
	isMuted: boolean;
	onToggle: () => void;
	className?: string;
}

export default function MuteButton({ isMuted, onToggle, className }: Props) {
	const Icon = isMuted ? VolumeOff : Volume2;
	return (
		<button
			type="button"
			className={className}
			onClick={onToggle}
			aria-label={isMuted ? "Activer la musique" : "Couper la musique"}
		>
			<Icon size={22} aria-hidden="true" />
		</button>
	);
}
