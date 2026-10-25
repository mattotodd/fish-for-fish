import { Scene } from "phaser";
import { RODS, BAITS, BOAT } from "../gear.js";
import { drawTiles, text, money, bucketValue } from "../draw.js";
import { save, persist } from "../save.js";
import { sfx } from "../sound.js";

export class ShopScene extends Scene {
  constructor() {
    super("Shop");
    this.cursor = 0;
  }

  create() {
    this.cameras.main.setBackgroundColor(0x5a3a1e);
    drawTiles(this, Array(14).fill("D".repeat(25)));
    this.add.rectangle(400, 224, 760, 400, 0x2a1a0e, 0.88);
    text(this, 400, 36, "THE SHOP", { fontSize: "32px", color: "#ffe066" }).setOrigin(0.5);
    this.moneyText = text(this, 400, 70, "", { fontSize: "18px", color: "#9bff9b" }).setOrigin(0.5);
    this.list = this.add.container(0, 0);
    this.msg = text(this, 400, 392, "", { fontSize: "16px", color: "#ffe9a8" }).setOrigin(0.5);
    text(this, 400, 428, "UP / DOWN: choose     SPACE: buy     ESC: leave", { fontSize: "13px", color: "#ffe9a8" }).setOrigin(0.5);

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
      if (i === 0) return;
      const owned = save.rod >= i;
      rows.push({
        label: rod.name + (owned ? "  (you have it)" : ""),
        price: owned ? "" : money(rod.price),
        act: () => {
          if (owned) return "You already have that one.";
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
        act: () => this.spend(bait.price, () => (save.bait[id] += bait.pack), `${bait.pack} ${bait.name}!`),
      });
    }
    rows.push({
      label: BOAT.name + (save.boat ? "  (you have it)" : "  (sail to new waters!)"),
      price: save.boat ? "" : money(BOAT.price),
      act: () => (save.boat ? "You already have a boat!" : this.spend(BOAT.price, () => (save.boat = true), "You bought a boat! Check the map!")),
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
    this.list.removeAll(true);
    this.moneyText.setText(`You have ${money(save.money)}`);
    this.msg.setText(message);
    this.items().forEach((row, i) => {
      const y = 108 + i * 30;
      const on = i === this.cursor;
      const color = on ? "#ffe066" : "#ffffff";
      this.list.add(text(this, 90, y, (on ? "▶ " : "  ") + row.label, { fontSize: "18px", color }));
      this.list.add(text(this, 710, y, row.price, { fontSize: "18px", color: on ? "#ffe066" : "#9bff9b" }).setOrigin(1, 0));
    });
  }
}
