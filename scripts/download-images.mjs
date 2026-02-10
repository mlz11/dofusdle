import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const monsters = JSON.parse(
	readFileSync(join(__dirname, "solomonk-monsters.json"), "utf-8"),
);

const outDir = join(__dirname, "..", "public", "img", "monsters");
mkdirSync(outDir, { recursive: true });

const CONCURRENCY = 10;
let downloaded = 0;
let skipped = 0;
let failed = 0;

async function downloadOne(monster) {
	const url = monster.image;
	const filename = url.split("/").pop();
	const dest = join(outDir, filename);

	if (existsSync(dest)) {
		skipped++;
		return;
	}

	try {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const body = await res.text();
		writeFileSync(dest, body);
		downloaded++;
	} catch (err) {
		console.error(`Failed: ${monster.name} (${url}): ${err.message}`);
		failed++;
	}
}

// Process in batches
for (let i = 0; i < monsters.length; i += CONCURRENCY) {
	const batch = monsters.slice(i, i + CONCURRENCY);
	await Promise.all(batch.map(downloadOne));
	const total = downloaded + skipped + failed;
	process.stdout.write(`\r${total}/${monsters.length}`);
}

console.log(
	`\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed`,
);
