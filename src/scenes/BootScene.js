import { Scene } from "phaser";
import { makeTexture } from "../art.js";
import { TILE_ART, KID_ART, ICON_ART } from "../tiles.js";
import { FISH } from "../fish.js";

// Turns all the letter art into sprites before the game starts.
export class BootScene extends Scene {
  constructor() {
    super("Boot");
  }

  create() {
    for (const [ch, grid] of Object.entries(TILE_ART)) makeTexture(this, "tile_" + ch, grid, 4);
    makeTexture(this, "kid", KID_ART, 2);
    for (const [key, grid] of Object.entries(ICON_ART)) makeTexture(this, key, grid, key === "bobber" ? 2 : 3);
    for (const [id, fish] of Object.entries(FISH)) makeTexture(this, "fish_" + id, fish.art, fish.scale);
    this.scene.start("Menu");
  }
}
