// Turns letter grids into Phaser textures. Each letter is a color from PALETTE, "." is see-through.
export const PALETTE = {
  k: "#222222", // black
  w: "#ffffff", // white
  r: "#d93a3a", // red
  o: "#e8883a", // orange
  y: "#f2c94c", // yellow
  g: "#4caf50", // green
  d: "#2e7d32", // dark green
  b: "#3a5fd9", // blue
  l: "#8fc7ff", // light blue
  u: "#2f80c8", // water
  v: "#2468a8", // deep water
  p: "#ff8fb3", // pink
  n: "#8b5a2b", // brown
  m: "#5a3a1e", // dark brown
  s: "#f2c9a0", // skin
  a: "#b8c2cc", // silver
  e: "#7a8591", // gray
  t: "#d9b382", // tan
  h: "#6b6b2a", // mud
  j: "#3d6b4f", // swamp water
  q: "#27493a", // deep swamp water
  z: "#8aa04a", // moss
  x: "#cbb58a", // cobblestone
  i: "#9c8760", // cobblestone shadow
  c: "#a82a2a", // dark red
};

// Draw a grid onto a canvas and register it as a texture. `scale` = screen pixels per letter.
export function makeTexture(scene, key, grid, scale = 1) {
  if (scene.textures.exists(key)) return;
  const w = Math.max(...grid.map((row) => row.length));
  const canvas = document.createElement("canvas");
  canvas.width = w * scale;
  canvas.height = grid.length * scale;
  const ctx = canvas.getContext("2d");
  grid.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const color = PALETTE[row[x]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  });
  scene.textures.addCanvas(key, canvas);
}
