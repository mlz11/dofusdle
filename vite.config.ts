import { execSync } from "node:child_process";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { loadEnv } from "vite";
import { vitePrerenderPlugin } from "vite-prerender-plugin";
import { defineConfig } from "vitest/config";

/**
 * Forces the process to exit after the build completes. The source-map
 * dependency used by vite-prerender-plugin initializes a WebAssembly worker
 * (MessagePort) at import time that keeps the Node.js event loop alive.
 */
function forceExitAfterBuild(): Plugin {
	return {
		name: "force-exit-after-build",
		apply: "build",
		enforce: "post",
		closeBundle() {
			process.exit(0);
		},
	};
}

/**
 * Strips the prerender entry's modulepreload / script tags from the HTML
 * and removes its sourcemap. The JS chunk itself is kept because Vite may
 * code-split shared dependencies into it, and the main bundle imports from
 * it at runtime.
 */
function removePrerenderChunk(): Plugin {
	return {
		name: "remove-prerender-chunk",
		apply: "build",
		enforce: "post",
		generateBundle(_, bundle) {
			const prerenderAssets: string[] = [];
			for (const key of Object.keys(bundle)) {
				if (key.endsWith(".js") && key.includes("prerender")) {
					prerenderAssets.push(key);
				}
				if (key.endsWith(".js.map") && key.includes("prerender")) {
					delete bundle[key];
				}
			}

			const html = bundle["index.html"];
			if (html && html.type === "asset" && typeof html.source === "string") {
				let source = html.source;
				for (const asset of prerenderAssets) {
					const escaped = asset.replace(/\./g, "\\.");
					source = source.replace(
						new RegExp(`\\s*<link[^>]+href="/${escaped}"[^>]*>`),
						"",
					);
					source = source.replace(
						new RegExp(`\\s*<script[^>]+src="/${escaped}"[^>]*></script>`),
						"",
					);
				}
				html.source = source;
			}
		},
	};
}

/**
 * Detect if running inside a git worktree and derive a stable unique port
 * from the worktree name so parallel agents don't collide on :5173.
 */
function getWorktreePort(): number | undefined {
	try {
		const gitDir = execSync("git rev-parse --git-dir", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		}).trim();
		const match = gitDir.match(/\/worktrees\/(.+)$/);
		if (!match) return undefined;
		const name = match[1];
		let hash = 0;
		for (const ch of name) {
			hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0;
		}
		return 5174 + (Math.abs(hash) % 100);
	} catch {
		return undefined;
	}
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "VITE_");
	const port = env.VITE_PORT ? Number(env.VITE_PORT) : getWorktreePort();

	const sentryOrg = process.env.SENTRY_ORG;
	const sentryProject = process.env.SENTRY_PROJECT;
	const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;

	if (mode === "production") {
		if (!sentryOrg) throw new Error("SENTRY_ORG is required");
		if (!sentryProject) throw new Error("SENTRY_PROJECT is required");
		if (!sentryAuthToken) throw new Error("SENTRY_AUTH_TOKEN is required");
	}

	return {
		plugins: [
			react(),
			vitePrerenderPlugin({
				renderTarget: "#root",
				prerenderScript: "src/prerender.tsx",
			}),
			removePrerenderChunk(),
			mode === "production" &&
				sentryVitePlugin({
					org: sentryOrg,
					project: sentryProject,
					authToken: sentryAuthToken,
				}),
			forceExitAfterBuild(),
		],
		build: {
			sourcemap: mode === "production" ? "hidden" : undefined,
		},
		server: {
			...(port !== undefined && { port, strictPort: true }),
		},
		test: {
			environment: "node",
		},
	};
});
