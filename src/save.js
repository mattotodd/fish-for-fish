import { RODS } from "./gear.js";

// Everything the player owns, saved in the browser so it survives a refresh.
const KEY = "gone-fishing-save-v1";

const NEW_GAME = {
  version: 2,
  money: 0,
  rod: 0, // index into RODS
  boat: 0, // 0 = no boat, otherwise how many boats you have bought (index into BOATS + 1)
  bait: { bread: 0, corn: 0, worm: 0, cricket: 0, shrimp: 0, livebait: 0, glowbug: 0, squid: 0, chicken: 0, lure: 0 }, // bread is unlimited
  selectedBait: "bread",
  snacks: {}, // snacks in your bag: { snackId: how many }
  selectedSnack: null,
  buffs: {}, // snacks you have eaten: { snackId: casts left }
  fish: [], // the bucket: { id, weight, value }
  trophies: [], // legendary fish you have caught (kept even after you sell them)
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) {
      if ((saved.version ?? 1) < 2) {
        // rods were added in the middle of the list, so find the old rod by name
        const oldRods = ["Stick Rod", "Bamboo Rod", "Fiberglass Rod", "Pro Carbon Rod", "Ocean Rod", "Big Game Rod"];
        saved.rod = Math.max(0, RODS.findIndex((r) => r.name === oldRods[saved.rod]));
        saved.version = 2;
      }
      if (typeof saved.boat === "boolean") saved.boat = saved.boat ? 1 : 0; // old saves
      const fresh = structuredClone(NEW_GAME);
      return { ...fresh, ...saved, bait: { ...fresh.bait, ...saved.bait } }; // new bait types appear in old saves
    }
  } catch (e) {
    // no save, or the browser blocked it: start fresh
  }
  return structuredClone(NEW_GAME);
}

export const save = load();

export function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch (e) {
    // saving is a bonus, never crash over it
  }
}

export function hasSave() {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch (e) {
    return false;
  }
}

export function newGame() {
  Object.assign(save, structuredClone(NEW_GAME));
  persist();
}
