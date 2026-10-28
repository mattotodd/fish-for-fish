import { Scene } from "phaser";
import { TOWN, TILE } from "../levels.js";
import { drawTiles, text, money, bucketValue } from "../draw.js";
import { save } from "../save.js";
import { sfx } from "../sound.js";
import { hint } from "../gamepad.js";
import { walk } from "../walk.js";

const OPEN = "fpd"; // grass, path and doors: the blocks you can walk on
const NEAR = 44; // how close to a door you need to be

// The village: walk around and step into the shops.
export class TownScene extends Scene {
  constructor() {
    super("Town");
  }

  init(data) {
    this.from = data.from;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x4caf50);
    drawTiles(this, TOWN.map);

    this.doors = TOWN.doors.map((door) => {
      const x = door.col * TILE + TILE / 2;
      text(this, x, 3 * TILE, door.name.toUpperCase(), { fontSize: "15px", color: "#ffffff", strokeThickness: 5 }).setOrigin(0.5).setDepth(2); // painted on the roof
      return { ...door, x, y: door.row * TILE + TILE };
    });

    // Start in front of the door you just came out of, or in the middle of the village.
    const back = this.doors.find((d) => d.store === this.from);
    const start = back ? { x: back.x, y: back.y + 20 } : { x: TOWN.start.col * TILE + TILE / 2, y: TOWN.start.row * TILE + TILE };
    this.kid = this.add.image(start.x, start.y, "kid").setOrigin(0.5, 1).setDepth(5);

    this.label = text(this, 400, 400, "", { fontSize: "18px", color: "#9bff9b" }).setOrigin(0.5).setDepth(10);
    this.hud = text(this, 790, 8, "", { fontSize: "14px", align: "right" }).setOrigin(1, 0).setDepth(10);
    this.hud.setText(`${money(save.money)}\nBucket: ${save.fish.length} fish (${money(bucketValue(save))})`);
    text(this, 400, 430, hint("ARROWS: walk     SPACE: go in     ESC: back to the map"), { fontSize: "13px", color: "#ffe9a8" })
      .setOrigin(0.5)
      .setDepth(10);

    this.keys = this.input.keyboard.addKeys({ left: "LEFT", right: "RIGHT", up: "UP", down: "DOWN" });
    this.near = null;
    this.input.keyboard.on("keydown-SPACE", () => this.enter());
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("Map"));
  }

  isFree(x, y) {
    return OPEN.includes(TOWN.map[Math.floor(y / TILE)]?.[Math.floor(x / TILE)] ?? "T");
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    walk(this.kid, this.keys, dt, (x, y) => this.isFree(x, y));
    this.near = this.doors.find((d) => Math.hypot(d.x - this.kid.x, d.y - this.kid.y) < NEAR) ?? null;
    this.label.setText(this.near ? hint(`${this.near.name}: press SPACE to go in!`) : "");
  }

  enter() {
    if (!this.near) return;
    sfx.select();
    this.scene.start("Store", { storeId: this.near.store });
  }
}
