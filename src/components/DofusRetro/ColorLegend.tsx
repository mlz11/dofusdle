interface ColorLegendProps {
	onClose: () => void;
}

export default function ColorLegend({ onClose }: ColorLegendProps) {
	return (
		<div className="color-legend">
			<button
				type="button"
				className="color-legend-close"
				onClick={onClose}
				aria-label="Fermer la légende"
			>
				✕
			</button>
			<div className="color-legend-items">
				<span className="color-legend-item">
					<span className="color-legend-swatch cell-correct" />
					Exact
				</span>
				<span className="color-legend-item">
					<span className="color-legend-swatch cell-partial" />
					Proche
				</span>
				<span className="color-legend-item">
					<span className="color-legend-swatch cell-wrong" />
					Mauvais
				</span>
				<span className="color-legend-item">
					<span className="color-legend-arrows">⬆⬇</span>
					Plus haut / bas
				</span>
			</div>
		</div>
	);
}
