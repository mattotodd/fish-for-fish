import { TILE } from "./levels.js";

// Stamp a text map onto the screen, one 32px block per character.
export function drawTiles(scene, map) {
  map.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      // dock posts stand in the water, so draw water behind them
      if (row[x] === "|") scene.add.image(x * TILE, y * TILE, "tile_o").setOrigin(0).setDepth(0);
      const key = "tile_" + row[x];
      if (scene.textures.exists(key)) scene.add.image(x * TILE, y * TILE, key).setOrigin(0).setDepth(0);
    }
  });
}

// Text with an outline so it is readable on any background.
export function text(scene, x, y, str, style = {}) {
  return scene.add.text(x, y, str, {
    fontFamily: '"Courier New", monospace',
    fontSize: "16px",
    color: "#ffffff",
    stroke: "#000000",
    strokeThickness: 3,
    resolution: 2,
    ...style,
  });
}

export const money = (n) => "$" + n;

export function bucketValue(save) {
  return save.fish.reduce((sum, f) => sum + f.value, 0);
}
