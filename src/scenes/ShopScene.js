import { Scene } from "phaser";
import { RODS, BAITS, BOATS } from "../gear.js";
import { drawTiles, text, money, bucketValue } from "../draw.js";
import { save, persist } from "../save.js";
import { sfx } from "../sound.js";
import { hint } from "../gamepad.js";

const VISIBLE = 11; // rows that fit on screen

export class ShopScene extends Scene {
  constructor() {
    super("Shop");
    this.cursor = 0;
    this.top = 0;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x5a3a1e);
    drawTiles(this, Array(14).fill("D".repeat(25)));
    this.add.rectangle(400, 224, 760, 400, 0x2a1a0e, 0.88);
    text(this, 400, 36, "THE SHOP", { fontSize: "32px", color: "#ffe066" }).setOrigin(0.5);
    this.moneyText = text(this, 400, 70, "", { fontSize: "18px", color: "#9bff9b" }).setOrigin(0.5);
    this.list = this.add.container(0, 0);
    this.msg = text(this, 400, 404, "", { fontSize: "16px", color: "#ffe9a8" }).setOrigin(0.5);
    text(this, 400, 428, hint("UP / DOWN: choose     SPACE: buy     ESC: leave"), { fontSize: "13px", color: "#ffe9a8" }).setOrigin(0.5);

    const kb = this.input.keyboard;
    kb.on("keydown-UP", () => this.move(-1));
    kb.on("keydown-DOWN", () => this.move(1));
    kb.on("keydown-SPACE", () => this.buy());
    kb.on("keydown-ESC", () => this.scene.start("Map"));
    this.render();
  }

  // Every row in the shop: what it says and what happens when you buy it.
  items() {
    const rows = [];
    const worth = bucketValue(save);
    rows.push({
      label: save.fish.length ? `SELL ALL FISH (${save.fish.length})` : "SELL ALL FISH (bucket is empty)",
      price: `+${money(worth)}`,
      act: () => {
        if (!save.fish.length) return "Your bucket is empty. Go catch something!";
        save.money += worth;
        save.fish = [];
        sfx.coin();
        return `Sold! You got ${money(worth)}.`;
      },
    });
    RODS.forEach((rod, i) => {
      if (i <= save.rod) return; // you already have it (or something better)
      rows.push({
        label: rod.name,
        price: money(rod.price),
        detail: `Strength ${rod.strength}   Reel speed ${rod.reel}   Casts ${rod.range}px   (yours: ${RODS[save.rod].name}, ${RODS[save.rod].strength} / ${RODS[save.rod].reel} / ${RODS[save.rod].range}px)`,
        act: () => {
          if (i > save.rod + 1) return `Buy the ${RODS[save.rod + 1].name} first.`;
          return this.spend(rod.price, () => (save.rod = i), `You got the ${rod.name}!`);
        },
      });
    });
    for (const [id, bait] of Object.entries(BAITS)) {
      if (!bait.pack) continue;
      rows.push({
        label: `${bait.name} x${bait.pack}  (have ${save.bait[id]})`,
        price: money(bait.price),
        detail: `Fish find it ${bait.biteSpeed}x faster` + (bait.luck ? `   Rare fish bite ${bait.luck}x more!` : ""),
        act: () => this.spend(bait.price, () => (save.bait[id] += bait.pack), `${bait.pack} ${bait.name}!`),
      });
    }
    BOATS.forEach((boat, i) => {
      if (save.boat >= i + 1) return; // you already have it
      rows.push({
        label: boat.name + "  (sail to new waters!)",
        price: money(boat.price),
        detail: `Top speed ${boat.speed}`,
        act: () => {
          if (i > save.boat) return `Buy the ${BOATS[save.boat].name} first.`;
          return this.spend(boat.price, () => (save.boat = i + 1), `You bought the ${boat.name}! Check the map!`);
        },
      });
    });
    return rows;
  }

  spend(price, give, thanks) {
    if (save.money < price) {
      sfx.no();
      return `Not enough money. You need ${money(price - save.money)} more.`;
    }
    save.money -= price;
    give();
    sfx.coin();
    return thanks;
  }

  move(dir) {
    const n = this.items().length;
    this.cursor = (this.cursor + dir + n) % n;
    sfx.select();
    this.render();
  }

  buy() {
    const message = this.items()[this.cursor].act();
    persist();
    this.render(message);
  }

  render(message = "") {
    const rows = this.items();
    this.cursor = Math.min(this.cursor, rows.length - 1); // rows disappear when you buy them
    // Keep the highlighted row on screen.
    if (this.cursor < this.top) this.top = this.cursor;
    if (this.cursor >= this.top + VISIBLE) this.top = this.cursor - VISIBLE + 1;
    this.top = Math.max(0, Math.min(this.top, rows.length - VISIBLE));

    this.list.removeAll(true);
    this.moneyText.setText(`You have ${money(save.money)}`);
    this.msg.setText(message);
    rows.slice(this.top, this.top + VISIBLE).forEach((row, n) => {
      const y = 94 + n * 22;
      const on = this.top + n === this.cursor;
      const color = on ? "#ffe066" : "#ffffff";
      this.list.add(text(this, 90, y, (on ? "▶ " : "  ") + row.label, { fontSize: "15px", color }));
      this.list.add(text(this, 710, y, row.price, { fontSize: "15px", color: on ? "#ffe066" : "#9bff9b" }).setOrigin(1, 0));
    });
    const more = { fontSize: "13px", color: "#ffe9a8", strokeThickness: 2 };
    if (this.top > 0) this.list.add(text(this, 740, 80, "▲ more", more).setOrigin(1, 0));
    if (this.top + VISIBLE < rows.length) this.list.add(text(this, 740, 94 + VISIBLE * 22, "▼ more", more).setOrigin(1, 0));
    this.list.add(text(this, 400, 382, rows[this.cursor].detail ?? "", { fontSize: "12px", color: "#b8c2cc", strokeThickness: 2 }).setOrigin(0.5));
  }
}
