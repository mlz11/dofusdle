import ArrowIcon from "./ArrowIcon";

export default function ColorLegend() {
	return (
		<div className="color-legend">
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
					<span className="color-legend-arrows">
						<ArrowIcon direction="up" size={12} decorative />
						<ArrowIcon direction="down" size={12} decorative />
					</span>
					Plus haut / bas
				</span>
			</div>
		</div>
	);
}
