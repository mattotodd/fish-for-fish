import { Scene, Math as PMath } from "phaser";
import { TILE, WORLD, LEVELS } from "../levels.js";
import { drawTiles, text, money, bucketValue } from "../draw.js";
import { save } from "../save.js";
import { sfx } from "../sound.js";

let selected = 1; // remember which spot you were on

export class MapScene extends Scene {
  constructor() {
    super("Map");
  }

  create() {
    this.cameras.main.setBackgroundColor(0x2f80c8);
    drawTiles(this, WORLD.map);

    this.spots = [...WORLD.spots].sort((a, b) => a.col - b.col);
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

    this.arrow = text(this, 0, 0, "▼", { fontSize: "24px", color: "#ffe066" }).setOrigin(0.5).setDepth(5);
    this.tweens.add({ targets: this.arrow, scaleY: 0.7, duration: 400, yoyo: true, repeat: -1 });
    this.label = text(this, 400, 24, "", { fontSize: "26px", color: "#ffe066" }).setOrigin(0.5).setDepth(5);
    this.msg = text(this, 400, 60, "", { fontSize: "16px", color: "#ffb0b0" }).setOrigin(0.5).setDepth(5);
    this.hud = text(this, 790, 8, "", { fontSize: "14px" }).setOrigin(1, 0).setDepth(5);
    text(this, 400, 428, "LEFT / RIGHT: pick a place     SPACE: go     ESC: title", {
      fontSize: "13px",
      color: "#ffe9a8",
    })
      .setOrigin(0.5)
      .setDepth(5);

    this.hud.setText(`${money(save.money)}\nBucket: ${save.fish.length} fish (${money(bucketValue(save))})`);
    this.moveTo(selected);

    const kb = this.input.keyboard;
    kb.on("keydown-LEFT", () => this.moveTo(selected - 1));
    kb.on("keydown-RIGHT", () => this.moveTo(selected + 1));
    kb.on("keydown-SPACE", () => this.enter());
    kb.on("keydown-ESC", () => this.scene.start("Menu"));
  }

  isLocked(spot) {
    return spot.unlocked ? !spot.unlocked(save) : false;
  }

  moveTo(i) {
    selected = PMath.Clamp(i, 0, this.spots.length - 1);
    const spot = this.spots[selected];
    this.arrow.setPosition(spot.col * TILE + TILE / 2, spot.row * TILE - 14);
    this.label.setText(this.isLocked(spot) ? "???" : spot.name);
    this.msg.setText("");
    sfx.select();
  }

  enter() {
    const spot = this.spots[selected];
    if (this.isLocked(spot)) {
      sfx.no();
      this.msg.setText(spot.locked);
    } else if (spot.scene === "Fish" && !LEVELS[spot.level]) {
      sfx.no();
      this.msg.setText("Coming soon! (Build it in src/levels.js)");
    } else {
      sfx.select();
      this.scene.start(spot.scene, { levelId: spot.level });
    }
  }
}
