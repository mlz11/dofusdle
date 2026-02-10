import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "src", "data", "monsters.json");

const raw = JSON.parse(
	readFileSync(join(__dirname, "solomonk-monsters.json"), "utf-8"),
);

// Load existing monsters.json to preserve manually-added fields (e.g. couleur)
const existingById = new Map();
if (existsSync(outPath)) {
	const existing = JSON.parse(readFileSync(outPath, "utf-8"));
	for (const m of existing) existingById.set(m.id, m);
}

const monsters = raw.map((m) => {
	const prev = existingById.get(m.id) || {};
	return {
		id: m.id,
		name: m.name,
		ecosystem: m.ecosystem,
		race: m.race,
		niveau_min: m.level_min,
		niveau_max: m.level_max,
		pv_min: m.hp_min,
		pv_max: m.hp_max,
		image: `/img/monsters/${m.image.split("/").pop()}`,
		...(prev.couleur ? { couleur: prev.couleur } : {}),
	};
});

writeFileSync(outPath, JSON.stringify(monsters, null, "\t"));

console.log(`Wrote ${monsters.length} monsters`);
