// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GameStats, GuessResult } from "../../../types";
import Victory from "../Victory";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const makeResult = (statuses: [string, string, string, string, string]): GuessResult =>
  ({
    monster: {} as GuessResult["monster"],
    feedback: {
      ecosystem: { value: "", status: statuses[0], arrow: null },
      race: { value: "", status: statuses[1], arrow: null },
      couleur: { value: "", status: statuses[2], arrow: null },
      niveau: { value: 0, status: statuses[3], arrow: null },
      pv: { value: 0, status: statuses[4], arrow: null },
    },
  }) as GuessResult;

const stats: GameStats = {
  gamesPlayed: 10,
  gamesWon: 7,
  currentStreak: 3,
  maxStreak: 5,
  guessDistribution: {},
};

const defaults = {
  results: [
    makeResult(["wrong", "partial", "correct", "wrong", "correct"]),
    makeResult(["correct", "correct", "correct", "correct", "correct"]),
  ],
  stats,
  targetName: "Bouftou",
  targetImage: "/img/monsters/bouftou.svg",
  hintsUsed: 0,
  onClose: vi.fn(),
};

function renderVictory(overrides: Partial<typeof defaults> = {}) {
  const props = {
    ...defaults,
    ...overrides,
    onClose: overrides.onClose ?? vi.fn(),
  };
  return { ...render(<Victory {...props} />), onClose: props.onClose };
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

function setupUser() {
  return userEvent.setup({
    advanceTimers: (ms) => vi.advanceTimersByTime(ms),
  });
}

describe("Victory", () => {
  describe("result text", () => {
    it("should display target monster name when rendered", () => {
      renderVictory();
      expect(screen.getByText("Bouftou")).toBeVisible();
    });

    it('should use singular "essai" when found in 1 guess', () => {
      renderVictory({
        results: [makeResult(["correct", "correct", "correct", "correct", "correct"])],
      });
      expect(screen.getByText(/Tu as trouvé/)).toHaveTextContent(
        "Tu as trouvé Bouftou en 1 essai.",
      );
    });

    it('should use plural "essais" when found in multiple guesses', () => {
      renderVictory();
      expect(screen.getByText(/essais\./)).toBeVisible();
    });
  });

  describe("monster image", () => {
    it("should display target monster image when image is provided", () => {
      renderVictory();
      expect(screen.getByAltText("Bouftou")).toBeVisible();
    });

    it("should not display an image when monster has no image", () => {
      renderVictory({ targetImage: undefined });
      expect(screen.queryByAltText("Bouftou")).not.toBeInTheDocument();
    });
  });

  describe("stats display", () => {
    it("should display all four stats when rendered", () => {
      renderVictory();
      expect(screen.getByText("10")).toBeVisible();
      expect(screen.getByText("70%")).toBeVisible();
      expect(screen.getByText("3")).toBeVisible();
      expect(screen.getByText("5")).toBeVisible();
    });

    it("should display 0% win rate when no games have been played", () => {
      renderVictory({
        stats: { ...stats, gamesPlayed: 0, gamesWon: 0 },
      });
      expect(screen.getByText("0%")).toBeVisible();
    });
  });

  describe("share button", () => {
    it("should copy share text to clipboard when share button is clicked", async () => {
      const user = setupUser();
      renderVictory();
      await user.click(screen.getByText("Partager"));
      await screen.findByText("Copié !");
      expect(await navigator.clipboard.readText()).not.toBe("");
    });

    it('should show "Copié !" feedback when share button is clicked', async () => {
      const user = setupUser();
      renderVictory();
      await user.click(screen.getByText("Partager"));
      expect(await screen.findByText("Copié !")).toBeVisible();
    });

    it('should revert to "Partager" after 2 seconds when share text has been copied', async () => {
      const user = setupUser();
      renderVictory();
      await user.click(screen.getByText("Partager"));
      await screen.findByText("Copié !");
      act(() => vi.advanceTimersByTime(2000));
      expect(screen.getByText("Partager")).toBeVisible();
    });
  });

  describe("share text content", () => {
    it("should include emoji grid matching guess results in share text", async () => {
      const user = setupUser();
      renderVictory();
      await user.click(screen.getByText("Partager"));
      await screen.findByText("Copié !");
      const text = await navigator.clipboard.readText();
      expect(text).toContain("🟥🟧🟩🟥🟩");
      expect(text).toContain("🟩🟩🟩🟩🟩");
    });

    it('should include singular "indice" in share text when 1 hint is used', async () => {
      const user = setupUser();
      renderVictory({ hintsUsed: 1 });
      await user.click(screen.getByText("Partager"));
      await screen.findByText("Copié !");
      const text = await navigator.clipboard.readText();
      expect(text).toContain("(+1 indice)");
      expect(text).not.toContain("indices");
    });

    it('should include plural "indices" in share text when 2 hints are used', async () => {
      const user = setupUser();
      renderVictory({ hintsUsed: 2 });
      await user.click(screen.getByText("Partager"));
      await screen.findByText("Copié !");
      const text = await navigator.clipboard.readText();
      expect(text).toContain("(+2 indices)");
    });

    it("should not include hint count in share text when no hints are used", async () => {
      const user = setupUser();
      renderVictory({ hintsUsed: 0 });
      await user.click(screen.getByText("Partager"));
      await screen.findByText("Copié !");
      const text = await navigator.clipboard.readText();
      expect(text).not.toContain("indice");
    });
  });

  describe("close behavior", () => {
    it("should close when clicking outside the modal", async () => {
      const user = setupUser();
      const { onClose } = renderVictory();
      await user.click(screen.getByText("Bravo !").closest(".victory-overlay")!);
      expect(onClose).toHaveBeenCalled();
    });

    it("should close when Escape key is pressed", async () => {
      const user = setupUser();
      const { onClose } = renderVictory();
      await user.keyboard("{Escape}");
      expect(onClose).toHaveBeenCalled();
    });

    it("should close when close button is clicked", async () => {
      const user = setupUser();
      const { onClose } = renderVictory();
      await user.click(screen.getByRole("button", { name: "Fermer" }));
      expect(onClose).toHaveBeenCalled();
    });

    it("should not close when clicking inside the modal", async () => {
      const user = setupUser();
      const { onClose } = renderVictory();
      await user.click(screen.getByText("Bravo !"));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe("countdown", () => {
    it("should display countdown to next monster", () => {
      renderVictory();
      expect(screen.getByText("Prochain monstre dans")).toBeVisible();
      expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible();
    });
  });
});
