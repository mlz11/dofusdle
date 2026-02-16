// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Monster } from "../../../types";
import SearchBar from "../SearchBar";
import styles from "../SearchBar.module.css";

afterEach(cleanup);

const monsters: Monster[] = [
	{
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
	},
	{
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
	},
	{
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
	},
];

const defaults = {
	monsters,
	usedIds: new Set<number>(),
	onSelect: vi.fn(),
	disabled: false,
};

function renderSearchBar(overrides: Partial<typeof defaults> = {}) {
	const props = { ...defaults, onSelect: vi.fn(), ...overrides };
	return { ...render(<SearchBar {...props} />), onSelect: props.onSelect };
}

describe("SearchBar", () => {
	describe("rendering", () => {
		it("should show guess prompt when game is in progress", () => {
			renderSearchBar();
			expect(screen.getByPlaceholderText("Devine le monstre...")).toBeVisible();
		});

		it("should show victory message when game is won", () => {
			renderSearchBar({ disabled: true });
			expect(
				screen.getByPlaceholderText("Bravo ! Reviens demain."),
			).toBeVisible();
		});

		it("should disable submit button after winning", () => {
			renderSearchBar({ disabled: true });
			expect(screen.getByRole("button", { name: "Valider" })).toBeDisabled();
		});
	});

	describe("filtering", () => {
		it("should show all monsters sorted by name when query is empty", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			const items = screen.getAllByRole("listitem");
			expect(items).toHaveLength(3);
			expect(items[0]).toHaveTextContent("Arakne");
			expect(items[1]).toHaveTextContent("Bouftou");
			expect(items[2]).toHaveTextContent("Tofu");
		});

		it("should filter monsters by fuzzy search when typing", async () => {
			renderSearchBar();
			await userEvent.type(
				screen.getByPlaceholderText("Devine le monstre..."),
				"tof",
			);
			const items = screen.getAllByRole("listitem");
			expect(items).toHaveLength(1);
			expect(items[0]).toHaveTextContent("Tofu");
		});

		it("should exclude already-guessed monsters from results", async () => {
			renderSearchBar({ usedIds: new Set([2]) });
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			const items = screen.getAllByRole("listitem");
			expect(items).toHaveLength(2);
			expect(items.map((i) => i.textContent)).not.toContain(
				expect.stringContaining("Tofu"),
			);
		});
	});

	describe("dropdown", () => {
		it("should open dropdown when input is focused", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			expect(screen.getAllByRole("listitem")).toHaveLength(3);
		});

		it("should open dropdown when typing", async () => {
			renderSearchBar();
			await userEvent.type(
				screen.getByPlaceholderText("Devine le monstre..."),
				"b",
			);
			expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0);
		});

		it("should close dropdown when clicking outside", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			expect(screen.getAllByRole("listitem")).toHaveLength(3);
			await userEvent.click(document.body);
			expect(screen.queryAllByRole("listitem")).toHaveLength(0);
		});

		it("should close dropdown when pressing Escape", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			expect(screen.getAllByRole("listitem")).toHaveLength(3);
			await userEvent.keyboard("{Escape}");
			expect(screen.queryAllByRole("listitem")).toHaveLength(0);
		});

		it("should hide dropdown when no monsters match", async () => {
			renderSearchBar();
			await userEvent.type(
				screen.getByPlaceholderText("Devine le monstre..."),
				"zzzzz",
			);
			expect(screen.queryAllByRole("listitem")).toHaveLength(0);
		});
	});

	describe("keyboard navigation", () => {
		it("should highlight first item by default", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			const items = screen.getAllByRole("listitem");
			expect(items[0]).toHaveClass(styles.highlighted);
		});

		it("should move highlight down when pressing ArrowDown", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			await userEvent.keyboard("{ArrowDown}");
			const items = screen.getAllByRole("listitem");
			expect(items[1]).toHaveClass(styles.highlighted);
		});

		it("should move highlight up when pressing ArrowUp", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowUp}");
			const items = screen.getAllByRole("listitem");
			expect(items[1]).toHaveClass(styles.highlighted);
		});

		it("should not move highlight above first item", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			await userEvent.keyboard("{ArrowUp}");
			const items = screen.getAllByRole("listitem");
			expect(items[0]).toHaveClass(styles.highlighted);
		});

		it("should not move highlight below last item", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			await userEvent.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
			const items = screen.getAllByRole("listitem");
			expect(items[2]).toHaveClass(styles.highlighted);
		});

		it("should select highlighted monster when pressing Enter", async () => {
			const { onSelect } = renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			await userEvent.keyboard("{ArrowDown}{Enter}");
			expect(onSelect).toHaveBeenCalledWith(
				expect.objectContaining({ name: "Bouftou" }),
			);
		});

		it("should auto-select single match when pressing Enter with dropdown closed", async () => {
			const { onSelect } = renderSearchBar();
			const input = screen.getByPlaceholderText("Devine le monstre...");
			await userEvent.type(input, "tofu");
			await userEvent.keyboard("{Escape}");
			expect(screen.queryAllByRole("listitem")).toHaveLength(0);
			await userEvent.keyboard("{Enter}");
			expect(onSelect).toHaveBeenCalledWith(
				expect.objectContaining({ name: "Tofu" }),
			);
		});
	});

	describe("selection", () => {
		it("should select monster when clicking a dropdown item", async () => {
			const { onSelect } = renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			await userEvent.click(screen.getByText("Bouftou"));
			expect(onSelect).toHaveBeenCalledWith(
				expect.objectContaining({ name: "Bouftou" }),
			);
		});

		it("should clear input after selecting a monster", async () => {
			renderSearchBar();
			const input = screen.getByPlaceholderText("Devine le monstre...");
			await userEvent.type(input, "tofu");
			await userEvent.click(screen.getByText("Tofu"));
			expect(input).toHaveValue("");
		});
	});

	describe("submit button", () => {
		it("should select highlighted monster when dropdown is open", async () => {
			const { onSelect } = renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			await userEvent.keyboard("{ArrowDown}");
			await userEvent.click(screen.getByRole("button", { name: "Valider" }));
			expect(onSelect).toHaveBeenCalledWith(
				expect.objectContaining({ name: "Bouftou" }),
			);
		});

		it("should auto-select single match when clicking submit", async () => {
			const { onSelect } = renderSearchBar();
			await userEvent.type(
				screen.getByPlaceholderText("Devine le monstre..."),
				"tofu",
			);
			await userEvent.keyboard("{Escape}");
			await userEvent.click(screen.getByRole("button", { name: "Valider" }));
			expect(onSelect).toHaveBeenCalledWith(
				expect.objectContaining({ name: "Tofu" }),
			);
		});

		it("should shake when submitting with empty query and dropdown closed", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			await userEvent.keyboard("{Escape}");
			await userEvent.click(screen.getByRole("button", { name: "Valider" }));
			expect(document.querySelector(`.${styles.searchBar}`)).toHaveClass(
				styles.shake,
			);
		});
	});

	describe("shake animation", () => {
		it("should shake when pressing Enter with no matches", async () => {
			renderSearchBar();
			await userEvent.type(
				screen.getByPlaceholderText("Devine le monstre..."),
				"zzzzz",
			);
			await userEvent.keyboard("{Enter}");
			expect(document.querySelector(`.${styles.searchBar}`)).toHaveClass(
				styles.shake,
			);
		});

		it("should shake when pressing Enter with multiple matches and dropdown closed", async () => {
			renderSearchBar();
			await userEvent.click(
				screen.getByPlaceholderText("Devine le monstre..."),
			);
			await userEvent.keyboard("{Escape}");
			await userEvent.keyboard("{Enter}");
			expect(document.querySelector(`.${styles.searchBar}`)).toHaveClass(
				styles.shake,
			);
		});
	});
});
