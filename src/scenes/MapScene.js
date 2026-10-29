import { Scene, Math as PMath } from "phaser";
import { TILE, WORLD, LEVELS, SAILS } from "../levels.js";
import { drawTiles, text, money, bucketValue } from "../draw.js";
import { save } from "../save.js";
import { sfx } from "../sound.js";
import { hint } from "../gamepad.js";

let selected = null; // remember which spot you were on (the first time, the dock)

export class MapScene extends Scene {
  constructor() {
    super("Map");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x2f80c8);
    drawTiles(this, WORLD.map);

    this.spots = [...WORLD.spots].sort((a, b) => a.col - b.col || a.row - b.row);
    this.spots.forEach((spot) => {
      const x = spot.col * TILE + TILE / 2;
      const y = spot.row * TILE + TILE / 2;
      const locked = this.isLocked(spot);
      const icon = this.add.image(x, y, spot.icon).setDepth(2);
      if (locked) {
        icon.setAlpha(0.45);
        this.add.image(x, y, "icon_lock").setDepth(3);
      }
    });

    // The map is bigger than the screen: the camera follows the arrow.
    this.cameras.main.setBounds(0, 0, WORLD.map[0].length * TILE, WORLD.map.length * TILE);
    this.arrow = text(this, 0, 0, "▼", { fontSize: "24px", color: "#ffe066" }).setOrigin(0.5).setDepth(5);
    this.tweens.add({ targets: this.arrow, scaleY: 0.7, duration: 400, yoyo: true, repeat: -1 });
    this.label = text(this, 400, 24, "", { fontSize: "26px", color: "#ffe066" }).setOrigin(0.5).setDepth(5).setScrollFactor(0);
    this.msg = text(this, 400, 60, "", { fontSize: "16px", color: "#ffb0b0" }).setOrigin(0.5).setDepth(5).setScrollFactor(0);
    this.hud = text(this, 790, 8, "", { fontSize: "14px" }).setOrigin(1, 0).setDepth(5).setScrollFactor(0);
    text(this, 400, 428, hint("ARROWS: pick a place     SPACE: go     ESC: title"), {
      fontSize: "13px",
      color: "#ffe9a8",
    })
      .setOrigin(0.5)
      .setDepth(5)
      .setScrollFactor(0);

    this.hud.setText(`${money(save.money)}\nBucket: ${save.fish.length} fish (${money(bucketValue(save))})\nTrophies: ${save.trophies.length}`);
    this.moveTo(selected ?? this.spots.findIndex((spot) => spot.id === "dock"));

    const kb = this.input.keyboard;
    kb.on("keydown-LEFT", () => this.step(-1, 0));
    kb.on("keydown-RIGHT", () => this.step(1, 0));
    kb.on("keydown-UP", () => this.step(0, -1));
    kb.on("keydown-DOWN", () => this.step(0, 1));
    kb.on("keydown-SPACE", () => this.enter());
    kb.on("keydown-ESC", () => this.scene.start("Menu"));
  }

  isLocked(spot) {
    return spot.unlocked ? !spot.unlocked(save) : false;
  }

  // Jump to the nearest place in the direction of the arrow key.
  step(dx, dy) {
    const here = this.spots[selected];
    let best = -1;
    let bestScore = Infinity;
    this.spots.forEach((spot, i) => {
      const sx = spot.col - here.col;
      const sy = spot.row - here.row;
      const ahead = sx * dx + sy * dy; // how far in the direction we pressed
      const side = Math.abs(sx * dy) + Math.abs(sy * dx); // how far off to the side
      if (i === selected || ahead <= 0) return;
      const score = ahead + side * 1.5;
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    });
    if (best >= 0) this.moveTo(best);
  }

  moveTo(i) {
    selected = PMath.Clamp(i, 0, this.spots.length - 1);
    const spot = this.spots[selected];
    this.arrow.setPosition(spot.col * TILE + TILE / 2, spot.row * TILE - 14);
    this.cameras.main.pan(spot.col * TILE + TILE / 2, spot.row * TILE, 250, "Sine.easeOut", true);
    this.label.setText(this.isLocked(spot) ? "???" : spot.name);
    this.msg.setText("");
    sfx.select();
  }

  enter() {
    const spot = this.spots[selected];
    const missing =
      (spot.scene === "Fish" && !LEVELS[spot.level]) || (spot.scene === "Sail" && !SAILS[spot.sail]);
    if (this.isLocked(spot)) {
      sfx.no();
      this.msg.setText(spot.locked);
    } else if (missing) {
      sfx.no();
      this.msg.setText("Coming soon! (Build it in src/levels.js)");
    } else {
      sfx.select();
      this.scene.start(spot.scene, { levelId: spot.level, sailId: spot.sail });
    }
  }
}
