import { mkdir, writeFile } from 'node:fs/promises';

const circles = [];
for (let ring = 0; ring < 42; ring++) {
  const latitude = (ring / 41) * Math.PI;
  const radius = Math.sin(latitude) * 174;
  for (let index = 0; index < 76; index++) {
    const longitude = (index / 76) * Math.PI * 2;
    const x = radius * Math.cos(longitude);
    const y = Math.cos(latitude) * 174;
    const z = radius * Math.sin(longitude);
    const angle = -0.4;
    const px = 260 + x * Math.cos(angle) - y * Math.sin(angle);
    const py = 247 + (x * Math.sin(angle) + y * Math.cos(angle)) * .85 + z * .32;
    circles.push(`<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${z > 0 ? 1.05 : .65}" opacity="${(.14 + ((z + 174) / 348) * .7).toFixed(3)}"/>`);
  }
}
await mkdir('public/images', { recursive: true });
await writeFile('public/images/point-sphere.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 500" fill="#e0b08e">${circles.join('')}</svg>`);
console.log('Generated static orbital point field.');
