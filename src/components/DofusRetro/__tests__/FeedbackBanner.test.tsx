// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FeedbackBanner from "../FeedbackBanner";

beforeEach(() => {
	vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

function setupUser() {
	return userEvent.setup({
		advanceTimers: (ms) => vi.advanceTimersByTime(ms),
	});
}

describe("FeedbackBanner", () => {
	it("should display feedback message when visible", () => {
		render(<FeedbackBanner visible={true} onDismiss={vi.fn()} />);
		expect(
			screen.getByText(
				"Tous les attributs correspondent, mais ce n'est pas le bon monstre !",
			),
		).toBeVisible();
	});

	it("should not render when not visible", () => {
		render(<FeedbackBanner visible={false} onDismiss={vi.fn()} />);
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("should dismiss when close button is clicked", async () => {
		const user = setupUser();
		const onDismiss = vi.fn();
		render(<FeedbackBanner visible={true} onDismiss={onDismiss} />);
		await user.click(screen.getByRole("button", { name: "Fermer" }));
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("should auto-dismiss after 5 seconds when visible", () => {
		const onDismiss = vi.fn();
		render(<FeedbackBanner visible={true} onDismiss={onDismiss} />);
		expect(onDismiss).not.toHaveBeenCalled();
		act(() => vi.advanceTimersByTime(5000));
		expect(onDismiss).toHaveBeenCalledOnce();
	});

	it("should have alert role for accessibility when visible", () => {
		render(<FeedbackBanner visible={true} onDismiss={vi.fn()} />);
		expect(screen.getByRole("alert")).toBeVisible();
	});
});
