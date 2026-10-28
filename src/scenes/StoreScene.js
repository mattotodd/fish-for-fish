import { Scene, Display } from "phaser";
import { STORES } from "../stores.js";
import { TILE } from "../levels.js";
import { drawTiles, text, money, bucketValue } from "../draw.js";
import { save } from "../save.js";
import { sfx } from "../sound.js";
import { hint } from "../gamepad.js";
import { walk } from "../walk.js";

const NEAR = 56; // how close you need to stand to an item to buy it

// Inside one of the shops. Walk up to something and press SPACE to buy it.
export class StoreScene extends Scene {
  constructor() {
    super("Store");
  }

  init(data) {
    this.storeId = data.storeId;
    this.leaving = false; // the scene is reused for every shop, so start fresh each time
  }

  create() {
    const store = (this.store = STORES[this.storeId]);
    this.cameras.main.setBackgroundColor(0x2a1a0e);
    drawTiles(this, store.map);
    text(this, 400, 22, store.name.toUpperCase(), { fontSize: "26px", color: "#ffe066" }).setOrigin(0.5).setDepth(5);
    if (store.keeper) this.add.image(store.keeper.x, store.keeper.y, "keeper").setOrigin(0.5, 1).setDepth(3);

    this.kid = this.add.image(400, 12 * TILE + 28, "kid").setOrigin(0.5, 1).setDepth(6);
    this.itemLayer = this.add.container(0, 0).setDepth(4);
    this.pointer = text(this, 0, 0, "▼", { fontSize: "22px", color: "#ffe066" }).setOrigin(0.5).setDepth(8).setVisible(false);
    this.tweens.add({ targets: this.pointer, scaleY: 0.7, duration: 400, yoyo: true, repeat: -1 });
    this.hud = text(this, 790, 8, "", { fontSize: "14px", align: "right" }).setOrigin(1, 0).setDepth(10);
    // The name of what you're next to and what it does, on a dark card so it's easy to read on any floor.
    this.infoCard = this.add.rectangle(400, 380, 780, 54, 0x10202e, 0.94).setStrokeStyle(2, 0xffe066).setDepth(9).setVisible(false);
    this.msgCard = this.add.rectangle(400, 56, 100, 34, 0x10202e, 0.94).setStrokeStyle(2, 0xffe066).setDepth(9).setVisible(false);
    this.msg = text(this, 400, 56, "", { fontSize: "20px", color: "#ffe066" }).setOrigin(0.5).setDepth(10);
    this.title = text(this, 400, 366, "", { fontSize: "18px", color: "#ffe066" }).setOrigin(0.5).setDepth(10);
    this.detail = text(this, 400, 392, "", { fontSize: "12px", color: "#d8e0e8", strokeThickness: 2 }).setOrigin(0.5).setDepth(10);
    text(this, 400, 430, hint("ARROWS: walk     SPACE: buy     ESC: leave"), { fontSize: "13px", color: "#ffe9a8" }).setOrigin(0.5).setDepth(10);

    this.keys = this.input.keyboard.addKeys({ left: "LEFT", right: "RIGHT", up: "UP", down: "DOWN" });
    this.input.keyboard.on("keydown-SPACE", (e) => !e.repeat && this.buy());
    this.input.keyboard.on("keydown-ESC", () => this.leave());
    this.near = null;
    this.refresh();
    this.clock = 0;
  }

  // Put everything on the shelves, based on what you have right now.
  refresh() {
    this.items = this.store.items();
    this.itemLayer.removeAll(true);
    this.rainbow = [];
    for (const item of this.items) {
      const dim = item.state === "owned" ? 0.45 : 1;
      let sprite;
      if (item.jar !== undefined) {
        sprite = this.add.container(item.x, item.y, [
          this.add.image(0, 0, "item_jar"),
          this.add.image(0, 0, "item_jar_fill").setTint(item.jar),
        ]);
      } else if (item.rod !== undefined) {
        sprite = this.add.image(item.x, item.y, "item_rod");
        if (item.rod === "rainbow") this.rainbow.push(sprite);
        else sprite.setTint(item.rod);
      } else if (item.boat !== undefined) {
        sprite = this.add.image(item.x, item.y, "boatsail_" + item.boat);
      } else if (item.icon) {
        sprite = this.add.image(item.x, item.y, item.icon);
      } else {
        sprite = this.add.image(item.x, item.y, "coin").setScale(1.6);
      }
      sprite.setAlpha(dim);
      this.itemLayer.add(sprite);
      const label = item.state === "owned" ? "OWNED" : item.state === "using" ? "IN USE" : item.price;
      const color = item.state === "ok" ? "#9bff9b" : item.state === "using" ? "#ffe066" : "#b8c2cc";
      // Shelf things hang their price just below; floor things (boats, the counter) put it underneath.
      const below = item.y < 150 ? 24 : 30;
      this.itemLayer.add(
        text(this, item.x, item.y + below, label, { fontSize: "11px", color, strokeThickness: 2, backgroundColor: "#10202e", padding: { x: 4, y: 1 } }).setOrigin(0.5)
      );
    }
    this.hud.setText(`${money(save.money)}\nBucket: ${save.fish.length} fish (${money(bucketValue(save))})`);
  }

  isFree(x, y) {
    const row = this.store.map[Math.floor(y / TILE)];
    const tile = row?.[Math.floor(x / TILE)];
    return tile === "F" || tile === "d";
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    this.clock += dt;
    walk(this.kid, this.keys, dt, (x, y) => this.isFree(x, y));
    if (this.store.map[Math.floor(this.kid.y / TILE)]?.[Math.floor(this.kid.x / TILE)] === "d") return this.leave();

    // The rainbow rod keeps changing color.
    const hue = Display.Color.HSVToRGB((this.clock * 0.5) % 1, 1, 1).color;
    this.rainbow.forEach((sprite) => sprite.setTint(hue));

    // Whatever you're standing closest to.
    let best = null;
    let bestDist = NEAR;
    for (const item of this.items) {
      const d = Math.hypot(item.x - this.kid.x, item.y - (this.kid.y - 14));
      if (d < bestDist) [best, bestDist] = [item, d];
    }
    if (best !== this.near) {
      this.near = best;
      this.showInfo(best);
    }
    this.pointer.setVisible(!!best);
    if (best) this.pointer.setPosition(best.x, best.y - 30 + Math.sin(this.clock * 6) * 3);
  }

  buy() {
    if (!this.near) return;
    const message = this.near.buy();
    this.showMessage(message);
    const key = this.near.key;
    this.refresh();
    this.near = this.items.find((i) => i.key === key) ?? null; // the same item, with its new price and stock
    this.showInfo(this.near);
  }

  showInfo(item) {
    this.title.setText(item ? `${item.name}   ${item.price}` : "");
    this.detail.setText(item?.detail ?? "");
    this.infoCard.setVisible(!!item);
  }

  showMessage(message) {
    this.msg.setText(message);
    this.msgCard.setSize(this.msg.width + 28, 34).setVisible(true);
    this.msgTimer?.remove();
    this.msgTimer = this.time.delayedCall(2600, () => {
      this.msg.setText("");
      this.msgCard.setVisible(false);
    });
  }

  leave() {
    if (this.leaving) return;
    this.leaving = true;
    sfx.select();
    this.scene.start("Town", { from: this.storeId });
  }
}
