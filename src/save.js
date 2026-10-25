// Everything the player owns, saved in the browser so it survives a refresh.
const KEY = "gone-fishing-save-v1";

const NEW_GAME = {
  money: 0,
  rod: 0, // index into RODS
  boat: false,
  bait: { bread: 0, worm: 0, shrimp: 0, glowbug: 0 }, // bread is unlimited
  selectedBait: "bread",
  fish: [], // the bucket: { id, weight, value }
};

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (saved) return { ...structuredClone(NEW_GAME), ...saved };
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
