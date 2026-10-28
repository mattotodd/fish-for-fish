import { Scene, Math as PMath } from "phaser";
import { SAILS, TILE, COLS, ROWS } from "../levels.js";
import { BOATS } from "../gear.js";
import { drawTiles, text, money, bucketValue } from "../draw.js";
import { save } from "../save.js";
import { sfx } from "../sound.js";
import { hint } from "../gamepad.js";

const WATER = "~oO"; // blocks you can drive on. Everything else (land, rocks) is in the way.
const HALF = 10; // half the boat's size, for bumping into things
const NEAR = 40; // how close to a fishing spot you need to be

const lastSpot = {}; // remember where you left the boat, per place

export class SailScene extends Scene {
  constructor() {
    super("Sail");
  }

  init(data) {
    this.sailId = data.sailId;
  }

  create() {
    const sail = (this.sail = SAILS[this.sailId]);
    this.cameras.main.setBackgroundColor(0x2f80c8);
    drawTiles(this, sail.map);

    const center = (cell) => ({ x: cell.col * TILE + TILE / 2, y: cell.row * TILE + TILE / 2 });
    const dock = center(sail.dock);
    this.add.image(dock.x, dock.y, "icon_dock").setDepth(2);

    this.spots = sail.spots.map((spot) => {
      const pos = center(spot);
      const marker = this.add.image(pos.x, pos.y, "icon_spot").setDepth(2);
      this.tweens.add({ targets: marker, scale: 1.4, alpha: 0.5, duration: 700, yoyo: true, repeat: -1 });
      text(this, pos.x, pos.y + 20, spot.name, { fontSize: "11px", strokeThickness: 2 }).setOrigin(0.5).setDepth(2);
      return { ...spot, ...pos };
    });

    const tier = save.boat - 1;
    this.speed = BOATS[tier].speed;
    const start = lastSpot[this.sailId] ?? center(sail.start);
    this.boat = this.add.image(start.x, start.y, "boatsail_" + tier).setDepth(5);
    this.heading = 0;

    this.title = text(this, 400, 20, sail.name, { fontSize: "22px", color: "#ffe066" }).setOrigin(0.5).setDepth(10);
    this.label = text(this, 400, 52, "", { fontSize: "18px", color: "#9bff9b" }).setOrigin(0.5).setDepth(10);
    this.hud = text(this, 790, 8, "", { fontSize: "14px", align: "right" }).setOrigin(1, 0).setDepth(10);
    this.hud.setText(`${money(save.money)}\nBucket: ${save.fish.length} fish (${money(bucketValue(save))})`);
    text(this, 400, 432, hint("ARROWS: drive     SPACE: fish at a spot     ESC: back to the map"), {
      fontSize: "13px",
      color: "#ffe9a8",
    })
      .setOrigin(0.5)
      .setDepth(10);

    this.keys = this.input.keyboard.addKeys({ left: "LEFT", right: "RIGHT", up: "UP", down: "DOWN" });
    this.near = null;
    this.input.keyboard.on("keydown-SPACE", () => this.fishHere());
    this.input.keyboard.on("keydown-ESC", () => this.scene.start("Map"));
  }

  isWater(x, y) {
    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return false;
    return WATER.includes(this.sail.map[row][col]);
  }

  // The boat is a small square: all four corners have to be over water.
  fits(x, y) {
    return [-HALF, HALF].every((dx) => [-HALF, HALF].every((dy) => this.isWater(x + dx, y + dy)));
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    let dx = (this.keys.right.isDown ? 1 : 0) - (this.keys.left.isDown ? 1 : 0);
    let dy = (this.keys.down.isDown ? 1 : 0) - (this.keys.up.isDown ? 1 : 0);
    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      const step = this.speed * dt;
      dx = (dx / len) * step;
      dy = (dy / len) * step;
      // Try each direction on its own so the boat slides along the shore instead of sticking.
      if (this.fits(this.boat.x + dx, this.boat.y)) this.boat.x += dx;
      if (this.fits(this.boat.x, this.boat.y + dy)) this.boat.y += dy;
      this.heading = Math.atan2(dy, dx);
    }
    this.boat.rotation = PMath.Angle.RotateTo(this.boat.rotation, this.heading, dt * 8);
    this.boat.y += Math.sin(time / 300) * 0.05; // gentle bobbing

    this.near = this.spots.find((s) => Math.hypot(s.x - this.boat.x, s.y - this.boat.y) < NEAR) ?? null;
    this.label.setText(this.near ? hint(`${this.near.name}: press SPACE to fish!`) : "");
  }

  fishHere() {
    if (!this.near) return;
    lastSpot[this.sailId] = { x: this.boat.x, y: this.boat.y };
    sfx.select();
    this.scene.start("Fish", { levelId: this.near.level, back: { scene: "Sail", data: { sailId: this.sailId } } });
  }
}
