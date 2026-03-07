import { PostHogErrorBoundary, PostHogProvider } from "@posthog/react";
import posthog from "posthog-js";
import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/app.css";
import App from "./components/App";

const phKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
if (phKey) {
	posthog.init(phKey, {
		api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
		defaults: "2026-01-30",
	});
} else {
	console.warn("VITE_PUBLIC_POSTHOG_KEY is not set, PostHog disabled");
}

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

const app = (
	<StrictMode>
		<PostHogProvider client={posthog}>
			<PostHogErrorBoundary>
				<BrowserRouter>
					<App />
				</BrowserRouter>
			</PostHogErrorBoundary>
		</PostHogProvider>
	</StrictMode>
);

if (root.children.length > 0) {
	hydrateRoot(root, app);
} else {
	createRoot(root).render(app);
}

// Initialize Sentry after render to keep it off the critical path
import("@sentry/react").then((Sentry) => {
	const dsn = import.meta.env.VITE_SENTRY_DSN;
	if (!dsn) {
		console.warn("VITE_SENTRY_DSN is not set, Sentry disabled");
		return;
	}
	Sentry.init({
		dsn,
		environment: import.meta.env.MODE,
		sendDefaultPii: true,
		integrations: [Sentry.browserTracingIntegration()],
		tracesSampleRate: 1.0,
		enableLogs: true,
	});
});
