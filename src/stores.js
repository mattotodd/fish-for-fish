// The four shops in the village. Each one is a little room you walk around in.
// An item sits at (x, y) in the room; stand next to it and press SPACE to buy.
//   state   "ok" you can buy it, "owned" you already have it, "using" it's what you have now
import { RODS, BAITS, BOATS } from "./gear.js";
import { SNACKS } from "./snacks.js";
import { save, persist } from "./save.js";
import { sfx } from "./sound.js";
import { money, bucketValue } from "./draw.js";
import { hint } from "./gamepad.js";

// What every shop looks like inside: walls and a shelf along the top, floor, and a door at the bottom.
const ROOM = [
  "HHHHHHHHHHHHHHHHHHHHHHHHH",
  "HHHHHHHHHHHHHHHHHHHHHHHHH",
  "NNNNNNNNNNNNNNNNNNNNNNNNN",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HFFFFFFFFFFFFFFFFFFFFFFFH",
  "HHHHHHHHHHHHdHHHHHHHHHHHH",
];
const MARKET_ROOM = ROOM.map((row, i) => (i === 6 ? "HFFFFFFFFUUUUUUUFFFFFFFFH" : row));

// Spreads n things along the shelf.
const shelfX = (i, n) => (n === 1 ? 400 : 64 + (i * (800 - 128)) / (n - 1));

// Buying: take the money, hand over the goods, say thanks.
function spend(price, give, thanks) {
  if (save.money < price) {
    sfx.no();
    return `Not enough money. You need ${money(price - save.money)} more.`;
  }
  save.money -= price;
  give();
  sfx.coin();
  persist();
  return thanks;
}

function baitItems() {
  const ids = Object.keys(BAITS).filter((id) => BAITS[id].pack);
  return ids.map((id, i) => {
    const bait = BAITS[id];
    return {
      key: "bait_" + id,
      name: `${bait.name} x${bait.pack}`,
      price: money(bait.price),
      detail: `You have ${save.bait[id]}.  Fish find it ${bait.biteSpeed}x faster` + (bait.luck ? `   Rare fish bite ${bait.luck}x more!` : ""),
      jar: bait.color,
      x: shelfX(i, ids.length),
      y: 78,
      state: "ok",
      buy: () => spend(bait.price, () => (save.bait[id] += bait.pack), `${bait.pack} ${bait.name}!`),
    };
  });
}

function tackleItems() {
  const you = RODS[save.rod];
  const rods = RODS.map((rod, i) => ({
    key: "rod_" + i,
    name: rod.name,
    price: money(rod.price),
    detail: `Strength ${rod.strength}   Reel speed ${rod.reel}   Casts ${rod.range}px   (yours: ${you.name}, ${you.strength} / ${you.reel} / ${you.range}px)`,
    rod: rod.color,
    x: shelfX(i, RODS.length),
    y: 78,
    state: i < save.rod ? "owned" : i === save.rod ? "using" : "ok",
    buy: () => {
      if (i <= save.rod) return `You already have a ${you.name} or better.`;
      if (i > save.rod + 1) return `Buy the ${RODS[save.rod + 1].name} first.`;
      return spend(rod.price, () => (save.rod = i), `You got the ${rod.name}!`);
    },
  }));
  const boats = BOATS.map((boat, i) => ({
    key: "boat_" + i,
    name: boat.name,
    price: money(boat.price),
    detail: `Top speed ${boat.speed}.  Sail to new waters!`,
    boat: i,
    x: shelfX(i, BOATS.length),
    y: 250,
    state: save.boat > i ? "owned" : "ok",
    buy: () => {
      if (save.boat > i) return `You already have the ${boat.name}.`;
      if (i > save.boat) return `Buy the ${BOATS[save.boat].name} first.`;
      return spend(boat.price, () => (save.boat = i + 1), `You bought the ${boat.name}! Check the map!`);
    },
  }));
  return [...rods, ...boats];
}

function snackItems() {
  const ids = Object.keys(SNACKS);
  return ids.map((id, i) => {
    const snack = SNACKS[id];
    return {
      key: "snack_" + id,
      name: snack.name,
      price: money(snack.price),
      detail: `${snack.blurb} for ${snack.casts} casts.  In your bag: ${save.snacks[id] ?? 0}`,
      icon: snack.icon,
      x: shelfX(i, ids.length),
      y: 78,
      state: "ok",
      buy: () =>
        spend(
          snack.price,
          () => {
            save.snacks[id] = (save.snacks[id] ?? 0) + 1;
            save.selectedSnack ??= id;
          },
          hint(`Got ${snack.name}! Eat it while you fish: press E!`)
        ),
    };
  });
}

function marketItems() {
  const worth = bucketValue(save);
  return [
    {
      key: "sell",
      name: "Sell all your fish",
      price: `+${money(worth)}`,
      detail: save.fish.length ? `${save.fish.length} fish in your bucket` : "Your bucket is empty. Go catch something!",
      x: 400,
      y: 200,
      state: "ok",
      buy: () => {
        if (!save.fish.length) {
          sfx.no();
          return "Your bucket is empty. Go catch something!";
        }
        const got = bucketValue(save);
        save.money += got;
        save.fish = [];
        sfx.coin();
        persist();
        return `Sold! You got ${money(got)}.`;
      },
    },
  ];
}

export const STORES = {
  bait: { name: "Bait Shop", map: ROOM, items: baitItems, keeper: { x: 720, y: 200 } },
  tackle: { name: "Tackle Shop", map: ROOM, items: tackleItems, keeper: { x: 720, y: 140 } },
  snacks: { name: "Snack Shack", map: ROOM, items: snackItems, keeper: { x: 720, y: 200 } },
  market: { name: "Fish Market", map: MARKET_ROOM, items: marketItems, keeper: { x: 400, y: 160 } },
};
