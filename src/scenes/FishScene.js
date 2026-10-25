import { Scene, Math as PMath } from "phaser";
import { LEVELS } from "../levels.js";
import { FISH } from "../fish.js";
import { RODS, BAITS } from "../gear.js";
import { save, persist } from "../save.js";
import { sfx } from "../sound.js";
import { drawTiles, text, money, bucketValue } from "../draw.js";

const CHARGE_TIME = 1.2; // seconds to fully charge a cast
const BITE_WINDOW = 1.3; // seconds you have to hook a fish after it bites
const HINTS = {
  idle: "HOLD SPACE to cast     UP: change bait     ESC: back to map",
  charging: "Let go of SPACE to cast!",
  casting: "",
  waiting: "Wait for a bite...  (pressing DOWN too soon scares the fish)",
  bite: "Press DOWN to hook it!",
  reeling: "Hold LEFT to reel in.  LET GO when the fish pulls!",
  card: "Press SPACE",
};

const rand = (a, b) => a + Math.random() * (b - a);

export class FishScene extends Scene {
  constructor() {
    super("Fish");
  }

  init(data) {
    this.levelId = data.levelId;
  }

  create() {
    const level = (this.level = LEVELS[this.levelId]);
    this.rod = RODS[save.rod];
    this.cameras.main.setBackgroundColor(level.sky);
    drawTiles(this, level.map);
    this.makeSwimmers();

    this.kid = this.add.image(level.kid.x, level.kid.y, "kid").setOrigin(0.5, 1).setDepth(5);
    this.bobber = this.add.image(0, 0, "bobber").setDepth(6).setVisible(false);
    this.underFish = this.add.image(0, 0, "fish_minnow").setDepth(3).setVisible(false);
    this.gfx = this.add.graphics().setDepth(7);
    this.bang = text(this, 0, 0, "!", { fontSize: "40px", color: "#ff3030", strokeThickness: 6 })
      .setOrigin(0.5)
      .setDepth(8)
      .setVisible(false);
    this.hud = text(this, 790, 8, "", { fontSize: "14px", align: "right" }).setOrigin(1, 0).setDepth(10);
    this.msg = text(this, 400, 70, "", { fontSize: "22px", color: "#ffe066" }).setOrigin(0.5).setDepth(10);
    this.meterLabels = this.add
      .container(0, 0)
      .setDepth(10)
      .setVisible(false)
      .add([
        text(this, 432, 379, "LINE", { fontSize: "11px", strokeThickness: 2 }).setOrigin(1, 0.5),
        text(this, 432, 403, "FISH", { fontSize: "11px", strokeThickness: 2 }).setOrigin(1, 0.5),
      ]);
    this.hint = text(this, 400, 432, "", { fontSize: "13px", color: "#ffe9a8" }).setOrigin(0.5).setDepth(10);

    this.state = "idle";
    this.charge = 0;
    this.rodAngle = -0.9;
    this.clock = 0;
    this.card = null;
    this.setState("idle");
    this.refreshHud();

    this.keys = this.input.keyboard.addKeys({ left: "LEFT" });
    const kb = this.input.keyboard;
    kb.on("keydown-SPACE", (e) => !e.repeat && this.onSpaceDown());
    kb.on("keyup-SPACE", () => this.onSpaceUp());
    kb.on("keydown-DOWN", (e) => !e.repeat && this.onDown());
    kb.on("keydown-UP", (e) => !e.repeat && this.onUp());
    kb.on("keydown-ESC", () => this.state === "idle" && this.scene.start("Map"));
  }

  // ---- little helpers ----

  setState(state) {
    this.state = state;
    this.hint.setText(HINTS[state] ?? "");
  }

  say(str, ms = 2200) {
    this.msg.setText(str);
    this.msgTimer?.remove();
    this.msgTimer = this.time.delayedCall(ms, () => this.msg.setText(""));
  }

  refreshHud() {
    const bait = BAITS[save.selectedBait];
    const left = save.selectedBait === "bread" ? "unlimited" : "x" + save.bait[save.selectedBait];
    this.hud.setText(
      `${money(save.money)}\nBucket: ${save.fish.length} fish (${money(bucketValue(save))})\n` +
        `Rod: ${this.rod.name}\nBait: ${bait.name} (${left})`
    );
  }

  // Dark fish silhouettes drifting around under the water, just for looks.
  makeSwimmers() {
    const ids = this.level.fish.filter((id) => !FISH[id].junk);
    this.swimmers = [];
    for (let i = 0; i < 6; i++) {
      const id = ids[i % ids.length];
      const sprite = this.add
        .image(rand(420, 780), rand(290, 420), "fish_" + id)
        .setDepth(1)
        .setTint(0x000000)
        .setAlpha(0.22);
      this.swimmers.push({ sprite, speed: rand(10, 30) * (Math.random() < 0.5 ? -1 : 1) });
    }
  }

  rodBase() {
    return { x: this.kid.x + 8, y: this.kid.y - 14 };
  }

  rodTip() {
    const base = this.rodBase();
    return { x: base.x + Math.cos(this.rodAngle) * this.rod.len, y: base.y + Math.sin(this.rodAngle) * this.rod.len };
  }

  // ---- key presses ----

  onSpaceDown() {
    if (this.state === "card") {
      this.card.destroy(true);
      this.card = null;
      this.setState("idle");
    } else if (this.state === "idle") {
      if (save.selectedBait !== "bread" && save.bait[save.selectedBait] <= 0) {
        save.selectedBait = "bread";
        this.refreshHud();
      }
      this.charge = 0;
      this.setState("charging");
    }
  }

  onSpaceUp() {
    if (this.state === "charging") this.startCast(this.charge);
  }

  onDown() {
    if (this.state === "waiting") {
      sfx.miss();
      this.endCast("Too early! Wait for the bobber to dip.");
    } else if (this.state === "bite") {
      this.startReel();
    }
  }

  onUp() {
    if (this.state !== "idle") return;
    const owned = Object.keys(BAITS).filter((id) => id === "bread" || save.bait[id] > 0);
    const next = owned[(owned.indexOf(save.selectedBait) + 1) % owned.length];
    save.selectedBait = next;
    persist();
    sfx.select();
    this.refreshHud();
  }

  // ---- the fishing steps ----

  landingX(power) {
    return Math.min(780, this.level.dockEnd + 40 + power * this.rod.range);
  }

  startCast(power) {
    if (save.selectedBait !== "bread") save.bait[save.selectedBait]--;
    persist();
    this.refreshHud();
    this.castBait = BAITS[save.selectedBait];
    this.castBaitId = save.selectedBait;
    const tip = this.rodTip();
    this.cast = { t: 0, from: tip, landX: this.landingX(power) };
    this.rodAngle = -0.2;
    this.bobber.setVisible(true).setPosition(tip.x, tip.y);
    this.setState("casting");
    sfx.cast();
  }

  // Picks what is biting, based on how far you cast and what bait you used.
  pickFish() {
    const dist = this.cast.landX - this.level.dockEnd;
    const pool = this.level.fish
      .map((id) => ({ id, fish: FISH[id] }))
      .filter(({ fish }) => dist >= fish.dist[0] && dist <= fish.dist[1])
      .map(({ id, fish }) => ({ id, weight: fish.rarity * (fish.likes.includes(this.castBaitId) ? 3 : 1) }));
    let roll = Math.random() * pool.reduce((sum, p) => sum + p.weight, 0);
    for (const p of pool) {
      roll -= p.weight;
      if (roll <= 0) return p.id;
    }
    return pool[0].id;
  }

  startWait() {
    this.wait = rand(2.5, 6) / this.castBait.biteSpeed;
    this.setState("waiting");
  }

  startBite() {
    this.hooked = this.pickFish();
    this.biteLeft = BITE_WINDOW;
    this.setState("bite");
    sfx.bite();
  }

  startReel() {
    const fish = FISH[this.hooked];
    const dist = this.cast.landX - this.level.dockEnd;
    this.reel = {
      fish,
      d: PMath.Clamp(dist / 400, 0.25, 1),
      tension: 0,
      pulling: false,
      phaseLeft: rand(0.4, 1),
      tick: 0,
    };
    this.reel.d0 = this.reel.d;
    this.bang.setVisible(false);
    this.underFish.setTexture("fish_" + this.hooked).setVisible(true);
    this.meterLabels.setVisible(true);
    this.setState("reeling");
  }

  endCast(message) {
    this.meterLabels.setVisible(false);
    this.bobber.setVisible(false);
    this.underFish.setVisible(false);
    this.bang.setVisible(false);
    this.setState("idle");
    if (message) this.say(message);
  }

  catchFish() {
    const fish = this.reel.fish;
    const [lo, hi] = fish.weight;
    const size = Math.random();
    const weight = Math.round((lo + size * (hi - lo)) * 10) / 10;
    const value = Math.max(1, Math.round(fish.price * (0.7 + 0.6 * size)));
    save.fish.push({ id: this.hooked, weight, value });
    persist();
    this.refreshHud();
    this.meterLabels.setVisible(false);
    this.bobber.setVisible(false);
    this.underFish.setVisible(false);
    fish.junk ? sfx.junk() : sfx.catch();
    this.showCard(fish, weight, value);
  }

  showCard(fish, weight, value) {
    const c = this.add.container(0, 0).setDepth(20);
    c.add(this.add.rectangle(400, 200, 420, 240, 0x10202e, 0.92).setStrokeStyle(4, 0xffe066));
    c.add(text(this, 400, 110, fish.junk ? "Yuck!" : "You caught one!", { fontSize: "26px", color: "#ffe066" }).setOrigin(0.5));
    c.add(this.add.image(400, 185, "fish_" + this.hooked).setScale(2.2));
    c.add(text(this, 400, 245, fish.name, { fontSize: "24px" }).setOrigin(0.5));
    c.add(text(this, 400, 275, `${weight} lbs     ${money(value)}`, { fontSize: "18px", color: "#9bff9b" }).setOrigin(0.5));
    this.card = c;
    this.setState("card");
  }

  // ---- every frame ----

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    this.clock += dt;
    this.swimmers.forEach(({ sprite, speed }) => {
      sprite.x += speed * dt;
      sprite.setFlipX(speed > 0);
      if (sprite.x < 400) sprite.x = 790;
      if (sprite.x > 790) sprite.x = 400;
    });

    const waterTop = this.level.waterTop;
    const g = this.gfx;
    g.clear();

    // Where the rod should point right now.
    let targetAngle = -0.9;
    if (this.state === "charging") targetAngle = -0.9 - this.charge * 0.8;
    if (this.state === "waiting" || this.state === "bite") targetAngle = -0.6;
    if (this.state === "reeling") targetAngle = -0.7 - (this.reel.tension > 0.7 ? 0.15 : 0);
    this.rodAngle += (targetAngle - this.rodAngle) * Math.min(1, dt * 10);

    if (this.state === "charging") this.updateCharging(dt, g);
    else if (this.state === "casting") this.updateCasting(dt);
    else if (this.state === "waiting") this.updateWaiting(dt, waterTop);
    else if (this.state === "bite") this.updateBite(dt, waterTop);
    else if (this.state === "reeling") this.updateReeling(dt, waterTop, g);

    // The rod and the line.
    const base = this.rodBase();
    const tip = this.rodTip();
    g.lineStyle(4, 0x5a3a1e).lineBetween(base.x, base.y, tip.x, tip.y);
    g.lineStyle(1, 0xffffff, 0.85);
    if (this.bobber.visible) g.lineBetween(tip.x, tip.y, this.bobber.x, this.bobber.y);
    else g.lineBetween(tip.x, tip.y, tip.x, tip.y + 28);
  }

  updateCharging(dt, g) {
    const before = this.charge;
    this.charge = Math.min(1, this.charge + dt / CHARGE_TIME);
    if (Math.floor(this.charge * 8) !== Math.floor(before * 8)) sfx.charge(this.charge);
    // Power bar next to the kid, plus a marker showing where the cast will land.
    this.bar(g, this.kid.x - 70, this.kid.y - 90, 70, 10, this.charge, 0xffe066);
    const x = this.landingX(this.charge);
    g.fillStyle(0xffe066).fillTriangle(x - 8, this.level.waterTop - 18, x + 8, this.level.waterTop - 18, x, this.level.waterTop - 4);
  }

  updateCasting(dt) {
    const c = this.cast;
    c.t = Math.min(1, c.t + dt / 0.55);
    this.bobber.x = PMath.Linear(c.from.x, c.landX, c.t);
    this.bobber.y = PMath.Linear(c.from.y, this.level.waterTop, c.t) - Math.sin(c.t * Math.PI) * 90;
    if (c.t >= 1) {
      sfx.splash();
      this.startWait();
    }
  }

  updateWaiting(dt, waterTop) {
    this.bobber.setPosition(this.cast.landX, waterTop - 2 + Math.sin(this.clock * 3) * 2);
    this.wait -= dt;
    if (this.wait <= 0) this.startBite();
  }

  updateBite(dt, waterTop) {
    // The bobber jerks under the water.
    this.bobber.setPosition(this.cast.landX + Math.sin(this.clock * 40) * 2, waterTop + 6 + Math.sin(this.clock * 25) * 4);
    this.bang.setVisible(true).setPosition(this.cast.landX, waterTop - 50);
    this.biteLeft -= dt;
    if (this.biteLeft <= 0) {
      sfx.miss();
      this.endCast("It got away...");
    }
  }

  updateReeling(dt, waterTop, g) {
    const r = this.reel;
    r.phaseLeft -= dt;
    if (r.phaseLeft <= 0) {
      r.pulling = !r.pulling;
      r.phaseLeft = r.pulling ? rand(0.6, 1.4) : rand(0.8, 2);
    }

    const reeling = this.keys.left.isDown;
    if (reeling) {
      r.d -= this.rod.reel * (r.pulling ? 0.3 : 1) * dt;
      r.tension += (r.pulling ? (0.9 * r.fish.fight) / this.rod.strength : 0.15) * dt;
      r.tick -= dt;
      if (r.tick <= 0) {
        sfx.reel();
        r.tick = 0.12;
      }
    } else {
      r.tension -= 0.7 * dt;
      if (r.pulling) r.d += 0.12 * r.fish.fight * dt;
    }
    r.tension = Math.max(0, r.tension);

    // Bobber and fish travel toward the dock as the line comes in.
    const x = PMath.Linear(this.level.dockEnd + 24, this.cast.landX, r.d / r.d0);
    this.bobber.setPosition(x, waterTop - 2 + Math.sin(this.clock * 8) * 2);
    const wiggle = r.pulling ? Math.sin(this.clock * 30) * 5 : Math.sin(this.clock * 6) * 2;
    this.underFish.setPosition(x - 8, waterTop + 34 + wiggle);
    this.underFish.setAngle(wiggle * 2);

    // Meters.
    const tensionColor = r.tension < 0.6 ? 0x4caf50 : r.tension < 0.85 ? 0xf2c94c : 0xd93a3a;
    this.bar(g, 440, 372, 340, 14, r.tension, tensionColor);
    this.bar(g, 440, 396, 340, 14, 1 - r.d / r.d0, 0x8fc7ff);
    this.hint.setText(r.pulling ? "THE FISH IS PULLING!  LET GO!" : HINTS.reeling);
    this.hint.setColor(r.pulling ? "#ff7070" : "#ffe9a8");

    if (r.tension >= 1) {
      sfx.snap();
      this.hint.setColor("#ffe9a8");
      this.endCast("SNAP! The line broke.");
    } else if (r.d >= r.d0 + 0.5) {
      sfx.miss();
      this.hint.setColor("#ffe9a8");
      this.endCast("The fish swam away...");
    } else if (r.d <= 0.02) {
      this.hint.setColor("#ffe9a8");
      this.catchFish();
    }
  }

  bar(g, x, y, w, h, frac, color) {
    g.fillStyle(0x000000, 0.6).fillRect(x - 2, y - 2, w + 4, h + 4);
    g.fillStyle(color).fillRect(x, y, w * PMath.Clamp(frac, 0, 1), h);
  }
}
