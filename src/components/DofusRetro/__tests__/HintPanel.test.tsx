// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import HintPanel from "../HintPanel";

afterEach(cleanup);

const defaults = {
	guessCount: 0,
	won: false,
	hint1Revealed: false,
	hint2Revealed: false,
	targetImage: "/img/monsters/42.svg",
	targetEcosystem: "Créatures des champs",
	onRevealHint1: vi.fn(),
	onRevealHint2: vi.fn(),
};

function renderPanel(overrides: Partial<typeof defaults> = {}) {
	const props = { ...defaults, ...overrides };
	return render(<HintPanel {...props} />);
}

describe("HintPanel", () => {
	describe("visibility", () => {
		it("should render nothing when game is won", () => {
			renderPanel({ won: true });
			expect(screen.queryByText("Indices")).not.toBeInTheDocument();
		});

		it("should render the panel when game is not won", () => {
			renderPanel({ won: false });
			expect(screen.getByText("Indices")).toBeVisible();
		});
	});

	describe("hint 1 - locked state", () => {
		it("should show hint 1 as locked when fewer than 5 guesses have been made", () => {
			renderPanel({ guessCount: 2 });
			expect(screen.getByText("dans 3 essais")).toBeVisible();
		});

		it('should show "dans 1 essai" when 1 guess remains to unlock hint 1', () => {
			renderPanel({ guessCount: 4 });
			expect(screen.getByText("dans 1 essai")).toBeVisible();
		});

		it('should show "dans X essais" when more than 1 guess remains to unlock hint 1', () => {
			renderPanel({ guessCount: 0 });
			expect(screen.getByText("dans 5 essais")).toBeVisible();
		});
	});

	describe("hint 1 - unlocked state", () => {
		it("should show hint 1 as unlockable when exactly 5 guesses have been made", () => {
			renderPanel({ guessCount: 5 });
			const buttons = screen.getAllByText("Cliquer pour révéler");
			expect(buttons[0]).toBeVisible();
		});

		it("should show hint 1 as unlockable when more than 5 guesses have been made", () => {
			renderPanel({ guessCount: 6 });
			const buttons = screen.getAllByText("Cliquer pour révéler");
			expect(buttons[0]).toBeVisible();
		});
	});

	describe("hint 1 - revealed state", () => {
		it("should reveal hint 1 blurred image when reveal button is clicked", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			const user = userEvent.setup({
				advanceTimers: (ms) => vi.advanceTimersByTime(ms),
			});
			const onRevealHint1 = vi.fn();
			renderPanel({ guessCount: 5, onRevealHint1 });

			const buttons = screen.getAllByText("Cliquer pour révéler");
			await user.click(buttons[0]);
			await vi.advanceTimersByTimeAsync(300);

			expect(onRevealHint1).toHaveBeenCalledOnce();
			vi.useRealTimers();
		});

		it('should show "Aucune image" when hint 1 is revealed but monster has no image', () => {
			renderPanel({
				hint1Revealed: true,
				targetImage: undefined,
			});
			expect(screen.getByText("Aucune image")).toBeVisible();
		});
	});

	describe("hint 2 - locked state", () => {
		it("should show hint 2 as locked when fewer than 8 guesses have been made", () => {
			renderPanel({ guessCount: 5 });
			expect(screen.getByText("dans 3 essais")).toBeVisible();
		});

		it('should show "dans 1 essai" when 1 guess remains to unlock hint 2', () => {
			renderPanel({ guessCount: 7 });
			expect(screen.getByText("dans 1 essai")).toBeVisible();
		});

		it('should show "dans X essais" when more than 1 guess remains to unlock hint 2', () => {
			renderPanel({ guessCount: 0 });
			expect(screen.getByText("dans 8 essais")).toBeVisible();
		});
	});

	describe("hint 2 - unlocked state", () => {
		it("should show hint 2 as unlockable when exactly 8 guesses have been made", () => {
			renderPanel({ guessCount: 8 });
			const hint2Button = screen
				.getAllByRole("button")
				.find((btn) => btn.textContent?.includes("Ecosystème"));
			expect(hint2Button).toBeVisible();
			expect(hint2Button).toHaveTextContent("Cliquer pour révéler");
		});

		it("should show hint 2 as unlockable when more than 8 guesses have been made", () => {
			renderPanel({ guessCount: 10 });
			const hint2Button = screen
				.getAllByRole("button")
				.find((btn) => btn.textContent?.includes("Ecosystème"));
			expect(hint2Button).toBeVisible();
			expect(hint2Button).toHaveTextContent("Cliquer pour révéler");
		});
	});

	describe("hint 2 - revealed state", () => {
		it("should reveal hint 2 ecosystem text when reveal button is clicked", async () => {
			vi.useFakeTimers({ shouldAdvanceTime: true });
			const user = userEvent.setup({
				advanceTimers: (ms) => vi.advanceTimersByTime(ms),
			});
			const onRevealHint2 = vi.fn();
			renderPanel({ guessCount: 8, hint1Revealed: true, onRevealHint2 });

			await user.click(screen.getByText("Cliquer pour révéler"));
			await vi.advanceTimersByTimeAsync(300);

			expect(onRevealHint2).toHaveBeenCalledOnce();
			vi.useRealTimers();
		});
	});

	describe("independent hint states", () => {
		it("should show hint 1 revealed and hint 2 still locked at the same time", () => {
			renderPanel({
				guessCount: 3,
				hint1Revealed: true,
				targetImage: "/img/monsters/42.svg",
			});
			expect(screen.getByRole("img", { name: "Indice visuel" })).toBeVisible();
			expect(screen.getByText("dans 5 essais")).toBeVisible();
		});

		it("should show hint 1 locked and hint 2 unlockable when 8 guesses made but hint 1 never revealed", () => {
			renderPanel({ guessCount: 8, hint1Revealed: false });
			const revealButtons = screen.getAllByText("Cliquer pour révéler");
			expect(revealButtons).toHaveLength(2);
		});
	});
});
