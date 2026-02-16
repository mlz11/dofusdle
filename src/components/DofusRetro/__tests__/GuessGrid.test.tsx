// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { GuessResult, Monster } from "../../../types";
import { makeMonsterWith } from "../../../utils/__tests__/helpers";
import AttributeCell from "../AttributeCell";
import GuessGrid from "../GuessGrid";
import GuessRow from "../GuessRow";

afterEach(cleanup);

function makeMonster(overrides: Partial<Monster> = {}): Monster {
	return makeMonsterWith({
		name: "Bouftou",
		ecosystem: "Plaines de Cania",
		race: "Bouftou",
		niveau_max: 20,
		pv_max: 50,
		couleur: "Orange",
		...overrides,
	});
}

function makeResult(
	monsterOverrides: Partial<Monster> = {},
	feedbackOverrides: Partial<GuessResult["feedback"]> = {},
): GuessResult {
	return {
		monster: makeMonster(monsterOverrides),
		feedback: {
			ecosystem: { value: "Plaines de Cania", status: "correct", arrow: null },
			race: { value: "Bouftou", status: "correct", arrow: null },
			couleur: { value: "Orange", status: "wrong", arrow: null },
			niveau: { value: 20, status: "partial", arrow: "up" },
			pv: { value: 50, status: "wrong", arrow: "down" },
			...feedbackOverrides,
		},
	};
}

describe("GuessGrid", () => {
	it("should render nothing when there are no guesses", () => {
		const { container } = render(
			<GuessGrid results={[]} animatingRowIndex={-1} />,
		);
		expect(container.firstChild).toBeNull();
	});

	it("should display column headers for all attributes", () => {
		render(<GuessGrid results={[makeResult()]} />);

		const header = within(
			screen.getByText("Monstre").parentElement as HTMLElement,
		);
		expect(header.getByText("Monstre")).toBeVisible();
		expect(header.getByText("Écosystème")).toBeVisible();
		expect(header.getByText("Race")).toBeVisible();
		expect(header.getByText("Couleur")).toBeVisible();
		expect(header.getByText("Niveau max")).toBeVisible();
		expect(header.getByText("PV max")).toBeVisible();
	});

	it("should show the newest guess at the top", () => {
		const first = makeResult(
			{ id: 1, name: "Bouftou" },
			{ race: { value: "Bouftou", status: "correct", arrow: null } },
		);
		const second = makeResult(
			{ id: 2, name: "Tofu" },
			{ race: { value: "Tofu", status: "wrong", arrow: null } },
		);
		const third = makeResult(
			{ id: 3, name: "Arakne" },
			{ race: { value: "Arakne", status: "wrong", arrow: null } },
		);

		const { container } = render(
			<GuessGrid results={[first, second, third]} />,
		);

		const grid = container.firstElementChild as HTMLElement;
		const rows = Array.from(grid.children).slice(1);
		expect(rows[0]).toHaveTextContent("Arakne");
		expect(rows[1]).toHaveTextContent("Tofu");
		expect(rows[2]).toHaveTextContent("Bouftou");
	});
});

describe("GuessRow", () => {
	it("should display the monster name and all five attributes", () => {
		const result = makeResult(
			{ name: "Craqueleur" },
			{
				ecosystem: {
					value: "Plaines de Cania",
					status: "correct",
					arrow: null,
				},
				race: { value: "Golem", status: "wrong", arrow: null },
				couleur: { value: "Bleu", status: "partial", arrow: null },
				niveau: { value: 80, status: "wrong", arrow: "down" },
				pv: { value: 300, status: "partial", arrow: "up" },
			},
		);

		render(<GuessRow result={result} />);

		expect(screen.getByText("Craqueleur")).toBeVisible();
		expect(screen.getByText("Plaines de Cania")).toBeVisible();
		expect(screen.getByText("Golem")).toBeVisible();
		expect(screen.getByText("Bleu")).toBeVisible();
		expect(screen.getByText("80")).toBeVisible();
		expect(screen.getByText("300")).toBeVisible();
	});

	it("should display the monster image when the monster has one", () => {
		const result = makeResult({ image: "/img/monsters/bouftou.svg" });

		const { container } = render(<GuessRow result={result} />);

		expect(container.querySelector("img")).toBeInTheDocument();
	});

	it("should not display an image when the monster has none", () => {
		const result = makeResult({ image: undefined });

		const { container } = render(<GuessRow result={result} />);

		expect(container.querySelector("img")).not.toBeInTheDocument();
	});
});

describe("AttributeCell", () => {
	it("should display the attribute label and value", () => {
		render(
			<AttributeCell
				label="Écosystème"
				feedback={{ value: "Plaines de Cania", status: "correct", arrow: null }}
			/>,
		);

		expect(screen.getByText("Écosystème")).toBeVisible();
		expect(screen.getByText("Plaines de Cania")).toBeVisible();
	});

	it('should show an up arrow labeled "Plus haut" when the value is too low', () => {
		render(
			<AttributeCell
				label="Niveau max"
				feedback={{ value: 20, status: "wrong", arrow: "up" }}
			/>,
		);

		expect(screen.getByLabelText("Plus haut")).toBeVisible();
	});

	it('should show a down arrow labeled "Plus bas" when the value is too high', () => {
		render(
			<AttributeCell
				label="PV max"
				feedback={{ value: 300, status: "wrong", arrow: "down" }}
			/>,
		);

		expect(screen.getByLabelText("Plus bas")).toBeVisible();
	});

	it("should show no arrow when the attribute is non-numeric", () => {
		render(
			<AttributeCell
				label="Écosystème"
				feedback={{ value: "Plaines de Cania", status: "correct", arrow: null }}
			/>,
		);

		expect(screen.queryByLabelText("Plus haut")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Plus bas")).not.toBeInTheDocument();
	});
});
