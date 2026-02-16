// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import type { GameStats } from "../../../types";
import Header from "../../Header";

afterEach(cleanup);

const defaultStats: GameStats = {
	gamesPlayed: 10,
	gamesWon: 7,
	currentStreak: 3,
	maxStreak: 5,
	guessDistribution: {},
};

function renderHeader(stats: Partial<GameStats> = {}) {
	return render(<Header stats={{ ...defaultStats, ...stats }} />);
}

describe("Header", () => {
	describe("logo home link", () => {
		it("should link to the home page when the logo is clicked", () => {
			renderHeader();
			const heading = screen.getByRole("heading", { level: 1 });
			const link = within(heading).getByRole("link");
			expect(link).toHaveAttribute("href", "/");
		});
	});

	describe("rendering", () => {
		it("should display the game subtitle when rendered", () => {
			renderHeader();
			expect(
				screen.getByText("Dofus Retro 1.29 — Devine le monstre du jour"),
			).toBeVisible();
		});

		it("should have a visually hidden SEO heading when rendered", () => {
			renderHeader();
			const heading = screen.getByRole("heading", { level: 1 });
			expect(heading).toHaveTextContent(
				"Dofusdle - Le Wordle des monstres Dofus Retro",
			);
			const seoText = heading.querySelector("span");
			expect(seoText).toHaveClass("visually-hidden");
		});

		it("should display the current streak count when rendered", () => {
			renderHeader({ currentStreak: 7 });
			expect(screen.getByText("7")).toBeVisible();
		});
	});

	describe("stats modal", () => {
		it("should open stats modal when stats button is clicked", async () => {
			renderHeader();
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			expect(screen.getByText("Statistiques")).toBeVisible();
		});

		it("should display all four statistics when stats modal is open", async () => {
			renderHeader({
				gamesPlayed: 20,
				gamesWon: 15,
				currentStreak: 4,
				maxStreak: 8,
			});
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			const heading = screen.getByRole("heading", { name: "Statistiques" });
			// Safe: getByRole guarantees the element is in the DOM, so parentElement exists
			const modalScope = within(heading.parentElement as HTMLElement);
			expect(modalScope.getByText("20")).toBeVisible();
			expect(modalScope.getByText("75%")).toBeVisible();
			expect(modalScope.getByText("4")).toBeVisible();
			expect(modalScope.getByText("8")).toBeVisible();
			expect(modalScope.getByText("Parties")).toBeVisible();
			expect(modalScope.getByText("Victoires")).toBeVisible();
			expect(modalScope.getByText("Série")).toBeVisible();
			expect(modalScope.getByText("Max série")).toBeVisible();
		});

		it("should show 0% win rate when no games have been played", async () => {
			renderHeader({ gamesPlayed: 0, gamesWon: 0 });
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			expect(screen.getByText("0%")).toBeVisible();
		});

		it("should calculate win percentage from games won and played", async () => {
			renderHeader({ gamesPlayed: 3, gamesWon: 1 });
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			expect(screen.getByText("33%")).toBeVisible();
		});

		it('should close stats modal when "Fermer" button is clicked', async () => {
			renderHeader();
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			await userEvent.click(screen.getByText("Fermer"));
			expect(screen.queryByText("Statistiques")).not.toBeInTheDocument();
		});

		it("should close stats modal when overlay is clicked", async () => {
			renderHeader();
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			const dialog = screen.getByRole("dialog", { name: "Statistiques" });
			// Click the overlay behind the dialog
			await userEvent.click(dialog.parentElement as HTMLElement);
			expect(screen.queryByText("Statistiques")).not.toBeInTheDocument();
		});

		it("should not close stats modal when modal content is clicked", async () => {
			renderHeader();
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			// Click on the heading text inside the modal
			await userEvent.click(screen.getByText("Parties"));
			expect(screen.getByText("Statistiques")).toBeVisible();
		});

		it("should close stats modal when Escape key is pressed", async () => {
			renderHeader();
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			await userEvent.keyboard("{Escape}");
			expect(screen.queryByText("Statistiques")).not.toBeInTheDocument();
		});

		it("should close stats modal when Enter key is pressed", async () => {
			renderHeader();
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			await userEvent.keyboard("{Enter}");
			expect(screen.queryByText("Statistiques")).not.toBeInTheDocument();
		});
	});

	describe("rules modal", () => {
		it("should open rules modal when rules button is clicked", async () => {
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: "Règles" }));
			expect(screen.getByText("Comment jouer")).toBeVisible();
		});

		it("should display game rules when rules modal is open", async () => {
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: "Règles" }));
			expect(screen.getByText(/Attribut exact/)).toBeVisible();
			expect(screen.getByText(/Proche/)).toBeVisible();
			expect(screen.getByText(/Pas de correspondance/)).toBeVisible();
			expect(screen.getByText(/Le vrai monstre est plus haut/)).toBeVisible();
		});

		it("should list all five attributes when rules modal is open", async () => {
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: "Règles" }));
			expect(screen.getByText("Écosystème")).toBeVisible();
			expect(screen.getByText("Race")).toBeVisible();
			expect(screen.getByText("Couleur")).toBeVisible();
			expect(screen.getByText("Niveau max")).toBeVisible();
			expect(screen.getByText("PV max")).toBeVisible();
		});

		it('should close rules modal when "Compris !" button is clicked', async () => {
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: "Règles" }));
			await userEvent.click(screen.getByText("Compris !"));
			expect(screen.queryByText("Comment jouer")).not.toBeInTheDocument();
		});

		it("should close rules modal when overlay is clicked", async () => {
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: "Règles" }));
			const dialog = screen.getByRole("dialog", { name: "Comment jouer" });
			// Click the overlay behind the dialog
			await userEvent.click(dialog.parentElement as HTMLElement);
			expect(screen.queryByText("Comment jouer")).not.toBeInTheDocument();
		});

		it("should not close rules modal when modal content is clicked", async () => {
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: "Règles" }));
			await userEvent.click(screen.getByText("Comment jouer"));
			expect(screen.getByText("Comment jouer")).toBeVisible();
		});

		it("should close rules modal when Escape key is pressed", async () => {
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: "Règles" }));
			await userEvent.keyboard("{Escape}");
			expect(screen.queryByText("Comment jouer")).not.toBeInTheDocument();
		});

		it("should close rules modal when Enter key is pressed", async () => {
			renderHeader();
			await userEvent.click(screen.getByRole("button", { name: "Règles" }));
			await userEvent.keyboard("{Enter}");
			expect(screen.queryByText("Comment jouer")).not.toBeInTheDocument();
		});
	});

	describe("edge cases", () => {
		it("should close both modals when Escape is pressed while both are open", async () => {
			renderHeader();
			await userEvent.click(
				screen.getByRole("button", { name: "Statistiques" }),
			);
			await userEvent.click(screen.getByRole("button", { name: "Règles" }));
			expect(screen.getByText("Statistiques")).toBeVisible();
			expect(screen.getByText("Comment jouer")).toBeVisible();
			await userEvent.keyboard("{Escape}");
			expect(screen.queryByText("Statistiques")).not.toBeInTheDocument();
			expect(screen.queryByText("Comment jouer")).not.toBeInTheDocument();
		});
	});
});
