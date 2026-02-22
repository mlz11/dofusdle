// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DailyProgress, GameStats } from "../../../types";
import Game from "../Game";

const {
	bouftou,
	bouftouRoyal,
	tofu,
	arakne,
	mockStorage,
	mockConfetti,
	mockDaily,
} = vi.hoisted(() => {
	const bouftou = {
		id: 1,
		name: "Bouftou",
		ecosystem: "Plaines de Cania",
		race: "Bouftous",
		niveau_min: 1,
		niveau_max: 10,
		pv_min: 10,
		pv_max: 50,
		couleur: "Orange",
		image: "/img/monsters/1.svg",
		availableFrom: "2025-1-1",
	};
	const bouftouRoyal = {
		id: 99,
		name: "Bouftou Royal",
		ecosystem: "Plaines de Cania",
		race: "Bouftous",
		niveau_min: 1,
		niveau_max: 10,
		pv_min: 10,
		pv_max: 50,
		couleur: "Orange",
		availableFrom: "2025-1-1",
	};
	const tofu = {
		id: 2,
		name: "Tofu",
		ecosystem: "Forêt d'Amakna",
		race: "Tofus",
		niveau_min: 1,
		niveau_max: 5,
		pv_min: 5,
		pv_max: 20,
		couleur: "Bleu",
		image: "/img/monsters/2.svg",
		availableFrom: "2025-1-1",
	};
	const arakne = {
		id: 3,
		name: "Arakne",
		ecosystem: "Bois de Litneg",
		race: "Araknes",
		niveau_min: 1,
		niveau_max: 4,
		pv_min: 4,
		pv_max: 16,
		couleur: "Vert",
		availableFrom: "2025-1-1",
	};
	return {
		bouftou,
		bouftouRoyal,
		tofu,
		arakne,
		mockDaily: {
			getDailyMonster: vi.fn(),
			getYesterdayMonster: vi.fn(),
			getTodayKey: vi.fn(),
			getYesterdayKey: vi.fn(),
		},
		mockStorage: {
			loadProgress: vi.fn((): DailyProgress | null => null),
			saveProgress: vi.fn(),
			loadStats: vi.fn(
				(): GameStats => ({
					gamesPlayed: 0,
					gamesWon: 0,
					currentStreak: 0,
					maxStreak: 0,
					guessDistribution: {},
					lastPlayedDate: null,
				}),
			),
			recordWin: vi.fn(
				(): GameStats => ({
					gamesPlayed: 1,
					gamesWon: 1,
					currentStreak: 1,
					maxStreak: 1,
					guessDistribution: { 1: 1 },
					lastPlayedDate: "2025-6-15",
				}),
			),
			saveTargetMonster: vi.fn(),
			loadTargetMonster: vi.fn((): number | null => null),
			getWinPercentage: (stats: GameStats) =>
				stats.gamesPlayed > 0
					? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
					: 0,
		},
		mockConfetti: vi.fn(),
	};
});

vi.mock("../../../data/monsters.json", () => ({
	default: [bouftou, bouftouRoyal, tofu, arakne],
}));

vi.mock("../../../utils/daily", () => mockDaily);

vi.mock("../../../utils/storage", () => mockStorage);

vi.mock("canvas-confetti", () => ({ default: mockConfetti }));

const emptyStats: GameStats = {
	gamesPlayed: 0,
	gamesWon: 0,
	currentStreak: 0,
	maxStreak: 0,
	guessDistribution: {},
	lastPlayedDate: null,
};

function GameWrapper({ initialStats }: { initialStats?: GameStats }) {
	const [stats, setStats] = useState<GameStats>(initialStats ?? emptyStats);
	return <Game stats={stats} onStatsChange={setStats} />;
}

function setupUser() {
	return userEvent.setup({
		advanceTimers: (ms) => vi.advanceTimersByTime(ms),
	});
}

async function guessMonster(user: ReturnType<typeof setupUser>, name: string) {
	const input = screen.getByPlaceholderText("Devine le monstre...");
	await user.type(input, name);
	await user.click(screen.getByText(name));
}

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
	mockDaily.getDailyMonster.mockReturnValue(bouftou);
	mockDaily.getYesterdayMonster.mockReturnValue(arakne);
	mockDaily.getTodayKey.mockReturnValue("2025-6-15");
	mockDaily.getYesterdayKey.mockReturnValue("2025-6-14");
	mockStorage.loadProgress.mockReturnValue(null);
	mockStorage.loadStats.mockReturnValue(emptyStats);
	mockStorage.recordWin.mockReturnValue({
		gamesPlayed: 1,
		gamesWon: 1,
		currentStreak: 1,
		maxStreak: 1,
		guessDistribution: { 1: 1 },
		lastPlayedDate: "2025-6-15",
	});
	mockStorage.loadTargetMonster.mockReturnValue(null);
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.clearAllMocks();
});

describe("Game", () => {
	describe("returning to the page", () => {
		it("should show previous guesses when returning to the page mid-game", () => {
			mockStorage.loadProgress.mockReturnValue({
				date: "2025-6-15",
				guesses: ["Tofu"],
				won: false,
			});
			render(<GameWrapper />);
			expect(screen.getByText("Tofu")).toBeVisible();
		});

		it("should show the victory modal when returning to the page after winning", () => {
			mockStorage.loadProgress.mockReturnValue({
				date: "2025-6-15",
				guesses: ["Bouftou"],
				won: true,
			});
			render(<GameWrapper />);
			expect(screen.getByText("Bravo !")).toBeVisible();
		});

		it("should show previously revealed hints when returning to the page mid-game", () => {
			mockStorage.loadProgress.mockReturnValue({
				date: "2025-6-15",
				guesses: ["Tofu"],
				won: false,
				hint1Revealed: true,
			});
			render(<GameWrapper />);
			expect(screen.getByRole("img", { name: "Indice visuel" })).toBeVisible();
		});
	});

	describe("guessing", () => {
		it("should display the guess result in the grid when a monster is selected", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Tofu");
			expect(
				screen.getByText("Tofu", { selector: "[class*='monsterName'] span" }),
			).toBeVisible();
		});

		it("should prevent further guessing after winning", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Bouftou");
			expect(
				screen.getByPlaceholderText("Bravo ! Reviens demain."),
			).toBeVisible();
		});
	});

	describe("winning", () => {
		it("should show the victory modal shortly after guessing the correct monster", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Bouftou");
			act(() => vi.advanceTimersByTime(2000));
			expect(screen.getByText("Bravo !")).toBeVisible();
		});

		it("should fire confetti when guessing the correct monster", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Bouftou");
			act(() => vi.advanceTimersByTime(1200));
			expect(mockConfetti).toHaveBeenCalled();
		});

		it("should show updated stats in the victory modal after winning", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Bouftou");
			act(() => vi.advanceTimersByTime(2000));
			expect(screen.getByText("100%")).toBeVisible();
			expect(
				screen.getByText("Parties").previousElementSibling,
			).toHaveTextContent("1");
		});
	});

	describe("results button", () => {
		it("should show a results button when the victory modal is closed", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Bouftou");
			expect(screen.queryByText("Voir résultats")).not.toBeInTheDocument();
			act(() => vi.advanceTimersByTime(2000));
			await user.keyboard("{Escape}");
			expect(screen.getByText("Voir résultats")).toBeVisible();
		});

		it("should reopen the victory modal when clicking the results button", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Bouftou");
			act(() => vi.advanceTimersByTime(2000));
			await user.keyboard("{Escape}");
			await user.click(screen.getByText("Voir résultats"));
			expect(screen.getByText("Bravo !")).toBeVisible();
		});

		it("should not show the results button before the player has won", () => {
			render(<GameWrapper />);
			expect(screen.queryByText("Voir résultats")).not.toBeInTheDocument();
		});
	});

	describe("color legend", () => {
		it("should show the color legend while guessing", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Tofu");
			expect(screen.getByText("Exact")).toBeVisible();
		});

		it("should hide the color legend after winning", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Bouftou");
			expect(screen.queryByText("Exact")).not.toBeInTheDocument();
		});
	});

	describe("yesterday's answer", () => {
		it("should display yesterday's monster below the game", () => {
			render(<GameWrapper />);
			expect(screen.getByText(/Arakne/)).toBeVisible();
		});
	});

	describe("day change detection", () => {
		it("should clear guesses when returning to the tab on a new day", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Tofu");
			expect(
				screen.getByText("Tofu", { selector: "[class*='monsterName'] span" }),
			).toBeVisible();

			mockDaily.getTodayKey.mockReturnValue("2025-6-16");
			mockDaily.getDailyMonster.mockReturnValue(tofu);
			act(() => {
				document.dispatchEvent(new Event("visibilitychange"));
			});

			expect(
				screen.queryByText("Tofu", { selector: "[class*='monsterName'] span" }),
			).not.toBeInTheDocument();
		});

		it("should close the victory modal when returning to the tab on a new day", () => {
			mockStorage.loadProgress.mockReturnValue({
				date: "2025-6-15",
				guesses: ["Bouftou"],
				won: true,
			});
			render(<GameWrapper />);
			expect(screen.getByText("Bravo !")).toBeVisible();

			mockDaily.getTodayKey.mockReturnValue("2025-6-16");
			mockDaily.getDailyMonster.mockReturnValue(tofu);
			mockStorage.loadProgress.mockReturnValue(null);
			act(() => {
				document.dispatchEvent(new Event("visibilitychange"));
			});

			expect(screen.queryByText("Bravo !")).not.toBeInTheDocument();
		});

		it("should keep guesses when returning to the tab on the same day", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Tofu");

			act(() => {
				document.dispatchEvent(new Event("visibilitychange"));
			});

			expect(
				screen.getByText("Tofu", { selector: "[class*='monsterName'] span" }),
			).toBeVisible();
		});

		it("should discard a guess when the day changes before it is submitted", async () => {
			const user = setupUser();
			render(<GameWrapper />);

			mockDaily.getTodayKey.mockReturnValue("2025-6-16");
			mockDaily.getDailyMonster.mockReturnValue(tofu);

			await guessMonster(user, "Tofu");

			expect(
				screen.queryByText("Tofu", { selector: "[class*='monsterName'] span" }),
			).not.toBeInTheDocument();
		});
	});

	describe("all-correct banner", () => {
		it("should show all-correct banner when guess matches all attributes but is wrong monster", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Bouftou Royal");
			act(() => vi.advanceTimersByTime(1200));
			expect(
				screen.getByText(
					"Tous les attributs correspondent, mais ce n'est pas le bon monstre !",
				),
			).toBeVisible();
		});

		it("should not show all-correct banner when guess wins the game", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Bouftou");
			act(() => vi.advanceTimersByTime(1200));
			expect(
				screen.queryByText(
					"Tous les attributs correspondent, mais ce n'est pas le bon monstre !",
				),
			).not.toBeInTheDocument();
		});

		it("should not show all-correct banner when guess has partial or wrong attributes", async () => {
			const user = setupUser();
			render(<GameWrapper />);
			await guessMonster(user, "Tofu");
			act(() => vi.advanceTimersByTime(1200));
			expect(
				screen.queryByText(
					"Tous les attributs correspondent, mais ce n'est pas le bon monstre !",
				),
			).not.toBeInTheDocument();
		});
	});
});
