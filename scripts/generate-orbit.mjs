// Generates the static point-cloud sphere used behind the hero orbit.
//
// Each dot is a zero-length path segment drawn with a round line cap, and dots
// are grouped by radius and (quantised) opacity. That renders the same field as
// one <circle> per point while producing far fewer DOM nodes and a smaller file.
import { mkdir, writeFile } from "node:fs/promises";

const RINGS = 42;
const POINTS_PER_RING = 76;
const SPHERE_RADIUS = 174;
const TILT = -0.4;
const OPACITY_LEVELS = 16;

const groups = new Map();
for (let ring = 0; ring < RINGS; ring++) {
  const latitude = (ring / (RINGS - 1)) * Math.PI;
  const radius = Math.sin(latitude) * SPHERE_RADIUS;
  for (let index = 0; index < POINTS_PER_RING; index++) {
    const longitude = (index / POINTS_PER_RING) * Math.PI * 2;
    const x = radius * Math.cos(longitude);
    const y = Math.cos(latitude) * SPHERE_RADIUS;
    const z = radius * Math.sin(longitude);
    const px = 260 + x * Math.cos(TILT) - y * Math.sin(TILT);
    const py = 247 + (x * Math.sin(TILT) + y * Math.cos(TILT)) * 0.85 + z * 0.32;
    const dotRadius = z > 0 ? 1.05 : 0.65;
    const opacity = 0.14 + ((z + SPHERE_RADIUS) / (2 * SPHERE_RADIUS)) * 0.7;
    const level = Math.round(((opacity - 0.14) / 0.7) * (OPACITY_LEVELS - 1));
    const key = `${dotRadius}|${level}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(`M${px.toFixed(1)} ${py.toFixed(1)}h0`);
  }
}

const paths = [...groups.entries()].map(([key, segments]) => {
  const [dotRadius, level] = key.split("|").map(Number);
  const opacity = 0.14 + (level / (OPACITY_LEVELS - 1)) * 0.7;
  return `<path stroke-width="${dotRadius * 2}" stroke-opacity="${opacity.toFixed(3)}" d="${segments.join("")}"/>`;
});

await mkdir("public/images", { recursive: true });
await writeFile(
  "public/images/point-sphere.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 500" fill="none" stroke="#e0b08e" stroke-linecap="round">${paths.join("")}</svg>`,
);
console.log(`Generated point field: ${RINGS * POINTS_PER_RING} points in ${paths.length} paths.`);
