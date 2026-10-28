import { Scene, Math as PMath, Display } from "phaser";
import { LEVELS } from "../levels.js";
import { FISH } from "../fish.js";
import { RODS, BAITS, BOATS } from "../gear.js";
import { save, persist } from "../save.js";
import { sfx } from "../sound.js";
import { hint } from "../gamepad.js";
import { SNACKS, boost } from "../snacks.js";
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
    this.back = data.back ?? { scene: "Map" }; // where ESC takes you
  }

  create() {
    const level = (this.level = LEVELS[this.levelId]);
    this.rod = RODS[save.rod];
    this.cameras.main.setBackgroundColor(level.sky);
    drawTiles(this, level.map);
    this.swimMin = level.dockEnd + 36;
    this.makeSwimmers();

    if (level.onBoat) {
      const boat = BOATS[save.boat - 1];
      this.add
        .image(level.dockEnd + 4, level.waterTop - 8 - boat.deckRow * 4, "boatview_" + (save.boat - 1))
        .setOrigin(1, 0)
        .setDepth(4);
    }
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
    kb.on("keydown-RIGHT", (e) => !e.repeat && this.onRight());
    kb.on("keydown-E", (e) => !e.repeat && this.onEat());
    kb.on("keydown-ESC", () => this.state === "idle" && this.scene.start(this.back.scene, this.back.data));
  }

  // ---- little helpers ----

  setState(state) {
    this.state = state;
    this.hint.setText(hint(state === "idle" ? this.idleHint() : HINTS[state] ?? ""));
  }

  idleHint() {
    if (!this.ownedSnacks().length) return HINTS.idle;
    return "HOLD SPACE to cast   UP: change bait   RIGHT: pick snack   E: eat   ESC: back";
  }

  ownedSnacks() {
    return Object.keys(SNACKS).filter((id) => save.snacks[id] > 0);
  }

  say(str, ms = 2200) {
    this.msg.setText(str);
    this.msgTimer?.remove();
    this.msgTimer = this.time.delayedCall(ms, () => this.msg.setText(""));
  }

  refreshHud() {
    const bait = BAITS[save.selectedBait];
    const left = save.selectedBait === "bread" ? "unlimited" : "x" + save.bait[save.selectedBait];
    const boosts = Object.entries(save.buffs).map(([id, casts]) => `${SNACKS[id].name} ${casts}`);
    const bag = this.ownedSnacks();
    const pick = bag.includes(save.selectedSnack) ? save.selectedSnack : bag[0];
    this.hud.setText(
      `${money(save.money)}\nBucket: ${save.fish.length} fish (${money(bucketValue(save))})\n` +
        `Rod: ${this.rod.name}\nBait: ${bait.name} (${left})` +
        (pick ? `\nSnack: ${SNACKS[pick].name} x${save.snacks[pick]}` : "") +
        (boosts.length ? `\nBoosts: ${boosts.join(", ")}` : "")
    );
  }

  // Dark fish silhouettes drifting around under the water, just for looks.
  makeSwimmers() {
    const ids = this.level.fish.filter((id) => !FISH[id].junk);
    this.swimmers = [];
    for (let i = 0; i < 6; i++) {
      const id = ids[i % ids.length];
      const sprite = this.add
        .image(rand(this.swimMin, 780), rand(290, 420), "fish_" + id)
        .setDepth(1)
        .setTint(0x000000)
        .setAlpha(0.22);
      sprite.setScale(Math.min(1, (FISH[id].bloop ? 700 : 300) / sprite.width)); // huge fish only show up as a shadow of this size
      this.swimmers.push({ sprite, speed: rand(10, 30) * (Math.random() < 0.5 ? -1 : 1) });
    }
  }

  rodColor() {
    if (this.rod.color !== "rainbow") return this.rod.color;
    return Display.Color.HSVToRGB((this.clock * 0.5) % 1, 1, 1).color;
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

  // RIGHT picks which snack you would eat next.
  onRight() {
    if (this.state !== "idle") return;
    const owned = this.ownedSnacks();
    if (!owned.length) return;
    save.selectedSnack = owned[(owned.indexOf(save.selectedSnack) + 1) % owned.length];
    persist();
    sfx.select();
    this.refreshHud();
  }

  // E eats the snack you picked: its boost lasts for the next few casts.
  onEat() {
    if (this.state !== "idle") return;
    const owned = this.ownedSnacks();
    if (!owned.length) {
      sfx.no();
      this.say("No snacks! Buy some at the Snack Shack.");
      return;
    }
    const id = owned.includes(save.selectedSnack) ? save.selectedSnack : owned[0];
    const snack = SNACKS[id];
    if (--save.snacks[id] <= 0) delete save.snacks[id];
    save.buffs[id] = snack.casts;
    save.selectedSnack = this.ownedSnacks().includes(id) ? id : this.ownedSnacks()[0] ?? null;
    persist();
    sfx.eat();
    this.say(`Yum! ${snack.blurb}!`);
    // The snack pops up over the kid's head while they munch.
    const food = this.add.image(this.kid.x, this.kid.y - 44, snack.icon).setDepth(9);
    this.tweens.add({ targets: food, y: this.kid.y - 74, alpha: 0, duration: 1000, onComplete: () => food.destroy() });
    this.tweens.add({ targets: this.kid, scaleY: 0.9, duration: 120, yoyo: true, repeat: 2 });
    this.refreshHud();
    this.hint.setText(hint(this.idleHint()));
  }

  // ---- the fishing steps ----

  landingX(power) {
    return Math.min(780, this.level.dockEnd + 40 + power * this.rod.range);
  }

  startCast(power) {
    if (save.selectedBait !== "bread") save.bait[save.selectedBait]--;
    // Snacks help for this whole cast, then use up one of their casts.
    this.boosts = { bite: boost(save.buffs, "bite"), strength: boost(save.buffs, "strength"), reel: boost(save.buffs, "reel"), luck: boost(save.buffs, "luck") };
    const wornOff = [];
    for (const id of Object.keys(save.buffs)) {
      if (--save.buffs[id] <= 0) {
        delete save.buffs[id];
        wornOff.push(SNACKS[id].name);
      }
    }
    if (wornOff.length) this.say(`Your ${wornOff.join(" and ")} wore off.`);
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
      .map(({ id, fish }) => ({ id, weight: fish.rarity * (fish.likes.includes(this.castBaitId) ? this.castBait.favorite ?? 3 : 1) * (fish.rarity <= 1 ? (this.castBait.luck ?? 1) * this.boosts.luck : 1) }));
    if (!pool.length) {
      // Nothing lives exactly this far out, so the fish whose water is closest bites.
      const away = (id) => Math.max(FISH[id].dist[0] - dist, dist - FISH[id].dist[1], 0);
      return this.level.fish.reduce((best, id) => (away(id) < away(best) ? id : best));
    }
    let roll = Math.random() * pool.reduce((sum, p) => sum + p.weight, 0);
    for (const p of pool) {
      roll -= p.weight;
      if (roll <= 0) return p.id;
    }
    return pool[0].id;
  }

  startWait() {
    this.wait = rand(2.5, 6) / (this.castBait.biteSpeed * this.boosts.bite);
    this.setState("waiting");
  }

  startBite() {
    this.hooked = this.pickFish();
    this.biteLeft = BITE_WINDOW;
    this.setState("bite");
    if (FISH[this.hooked].bloop) {
      sfx.bloop();
      this.cameras.main.shake(900, 0.008);
    } else {
      sfx.bite();
    }
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
    // A giant has its nose on the hook and its huge body trailing off behind it.
    this.underFish.setOrigin(fish.bloop ? 0 : 0.5, 0.5);
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
    if (fish.legendary) this.celebrate(fish);
  }

  showCard(fish, weight, value) {
    const c = this.add.container(0, 0).setDepth(20);
    const title = fish.junk ? "Yuck!" : fish.legendary ? "WOW!!!" : "You caught one!";
    if (fish.bloop) {
      // A giant gets a giant card, with the whole monster showing across it.
      c.add(this.add.rectangle(400, 232, 780, 340, 0x10202e, 0.94).setStrokeStyle(4, 0xffe066));
      const picture = this.add.image(400, 218, "fish_" + this.hooked);
      c.add(picture.setScale(Math.min(2.2, 760 / picture.width, 290 / picture.height)));
      c.add(text(this, 400, 96, title, { fontSize: "26px", color: "#ffe066", strokeThickness: 6 }).setOrigin(0.5));
      c.add(text(this, 400, 336, fish.name, { fontSize: "28px", strokeThickness: 6 }).setOrigin(0.5));
      c.add(text(this, 400, 372, `${weight} lbs     ${money(value)}`, { fontSize: "18px", color: "#9bff9b", strokeThickness: 5 }).setOrigin(0.5));
    } else {
      c.add(this.add.rectangle(400, 200, 420, 240, 0x10202e, 0.92).setStrokeStyle(4, 0xffe066));
      c.add(text(this, 400, 110, title, { fontSize: "26px", color: "#ffe066" }).setOrigin(0.5));
      const picture = this.add.image(400, 180, "fish_" + this.hooked);
      c.add(picture.setScale(Math.min(2.2, 290 / picture.width, 100 / picture.height))); // big fish shrink to fit the card
      c.add(text(this, 400, 245, fish.name, { fontSize: "24px" }).setOrigin(0.5));
      c.add(text(this, 400, 275, `${weight} lbs     ${money(value)}`, { fontSize: "18px", color: "#9bff9b" }).setOrigin(0.5));
    }
    this.card = c;
    this.setState("card");
  }

  // A legendary fish! Flash, fanfare, confetti, and a trophy that you keep even after selling the fish.
  celebrate(fish) {
    const firstTime = !save.trophies.includes(this.hooked);
    if (firstTime) save.trophies.push(this.hooked);
    persist();
    sfx.legendary();

    const flash = this.add.rectangle(400, 224, 800, 448, 0xffffff, 0.9).setDepth(30);
    this.tweens.add({ targets: flash, alpha: 0, duration: 700, onComplete: () => flash.destroy() });

    const colors = [0xffe066, 0xff6b6b, 0x6bcbff, 0x9bff9b, 0xff8fb3];
    for (let i = 0; i < 90; i++) {
      const piece = this.add
        .rectangle(rand(0, 800), rand(-200, -10), 8, 12, colors[i % colors.length])
        .setDepth(31)
        .setAngle(rand(0, 360));
      this.tweens.add({
        targets: piece,
        y: 470,
        x: piece.x + rand(-80, 80),
        angle: piece.angle + rand(-400, 400),
        duration: rand(1800, 3200),
        delay: rand(0, 900),
        onComplete: () => piece.destroy(),
      });
    }

    const banner = text(this, 400, 30, "LEGENDARY CATCH!!!", { fontSize: "40px", color: "#ffe066", strokeThickness: 8 })
      .setOrigin(0.5)
      .setDepth(32);
    this.tweens.add({ targets: banner, scale: 1.15, duration: 350, yoyo: true, repeat: 8 });
    const note = firstTime ? `NEW TROPHY: ${fish.name}!` : `You caught the ${fish.name} again!`;
    const sub = text(this, 400, 66, note, { fontSize: "20px", color: "#9bff9b" }).setOrigin(0.5).setDepth(32);
    this.time.delayedCall(5000, () => {
      banner.destroy();
      sub.destroy();
    });
  }

  // ---- every frame ----

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.05);
    this.clock += dt;
    this.swimmers.forEach(({ sprite, speed }) => {
      sprite.x += speed * dt;
      sprite.setFlipX(speed > 0);
      if (sprite.x < this.swimMin - 20) sprite.x = 790;
      if (sprite.x > 790) sprite.x = this.swimMin - 20;
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
    g.lineStyle(4, this.rodColor()).lineBetween(base.x, base.y, tip.x, tip.y);
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
      r.d -= this.rod.reel * this.boosts.reel * (r.pulling ? 0.3 : 1) * dt;
      r.tension += (r.pulling ? (0.9 * r.fish.fight) / (this.rod.strength * this.boosts.strength) : 0.15) * dt;
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
    this.hint.setText(r.pulling ? "THE FISH IS PULLING!  LET GO!" : hint(HINTS.reeling));
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
