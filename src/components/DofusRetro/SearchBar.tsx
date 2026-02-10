import { useEffect, useRef, useState } from "react";
import type { Monster } from "../../types";

interface Props {
	monsters: Monster[];
	usedIds: Set<number>;
	onSelect: (monster: Monster) => void;
	disabled: boolean;
}

export default function SearchBar({
	monsters,
	usedIds,
	onSelect,
	disabled,
}: Props) {
	const [query, setQuery] = useState("");
	const [showDropdown, setShowDropdown] = useState(false);
	const [highlightIndex, setHighlightIndex] = useState(0);
	const [shaking, setShaking] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	const filtered =
		query.length > 0
			? monsters.filter(
					(m) =>
						!usedIds.has(m.id) &&
						m.name.toLowerCase().includes(query.toLowerCase()),
				)
			: [];

	useEffect(() => {
		setHighlightIndex(0);
	}, []);

	function handleSelect(monster: Monster) {
		onSelect(monster);
		setQuery("");
		setShowDropdown(false);
		inputRef.current?.focus();
	}

	function triggerShake() {
		setShaking(true);
		setTimeout(() => setShaking(false), 400);
	}

	function handleKeyDown(e: React.KeyboardEvent) {
		if (!showDropdown || filtered.length === 0) {
			if (e.key === "Enter") {
				e.preventDefault();
				if (filtered.length === 1) {
					handleSelect(filtered[0]);
				} else {
					triggerShake();
				}
			}
			return;
		}
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setHighlightIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			if (filtered[highlightIndex]) {
				handleSelect(filtered[highlightIndex]);
			}
		} else if (e.key === "Escape") {
			setShowDropdown(false);
		}
	}

	function handleSubmit() {
		if (showDropdown && filtered[highlightIndex]) {
			handleSelect(filtered[highlightIndex]);
		} else if (filtered.length > 0) {
			handleSelect(filtered[0]);
		} else {
			triggerShake();
		}
	}

	const canSubmit = !disabled && filtered.length > 0;

	return (
		<div className={`search-bar ${shaking ? "shake" : ""}`}>
			<div className="search-input-wrapper">
				<input
					ref={inputRef}
					type="text"
					placeholder={
						disabled ? "Bravo ! Reviens demain." : "Devine le monstre..."
					}
					value={query}
					disabled={disabled}
					onChange={(e) => {
						setQuery(e.target.value);
						setShowDropdown(true);
					}}
					onFocus={() => setShowDropdown(true)}
					onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
					onKeyDown={handleKeyDown}
					autoComplete="off"
				/>
				<button
					type="button"
					className="submit-btn"
					disabled={!canSubmit}
					onMouseDown={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					aria-label="Valider"
				>
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						role="img"
						aria-label="Valider"
					>
						<title>Valider</title>
						<line x1="5" y1="12" x2="19" y2="12" />
						<polyline points="12 5 19 12 12 19" />
					</svg>
				</button>
			</div>
			{showDropdown && filtered.length > 0 && (
				<ul className="search-dropdown">
					{filtered.slice(0, 8).map((m, i) => (
						<li
							key={m.id}
							className={i === highlightIndex ? "highlighted" : ""}
							onMouseDown={() => handleSelect(m)}
							onMouseEnter={() => setHighlightIndex(i)}
						>
							{m.name}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
