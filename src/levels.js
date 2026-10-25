// Levels are text maps: each character is one 32-pixel block.
//   .  sky     c  cloud    L  leaves   Y  tree trunk
//   G  grass   D  dirt     =  dock     |  dock post
//   ~  water surface       o  water    O  deep water
// The map screen uses f (flat grass) and S (sand) too.

export const COLS = 25;
export const ROWS = 14;
export const TILE = 32;

export const LEVELS = {
  dock: {
    name: "The Old Dock",
    sky: 0x8fd3ff,
    map: [
      ".........................",
      "......cc............ccc..",
      ".....cccc..........cc....",
      ".LLL.....................",
      "LLLLL....................",
      "..Y......................",
      "..Y......................",
      "GGGGG=======.............",
      "DDDDD~~|~~~|~~~~~~~~~~~~~",
      "DDDDDoo|ooo|ooooooooooooo",
      "DDDDDoo|ooo|ooooooooooooo",
      "DDDDDOOOOOOOOOOOOOOOOOOOO",
      "DDDDDOOOOOOOOOOOOOOOOOOOO",
      "DDDDDOOOOOOOOOOOOOOOOOOOO",
    ],
    // Where the kid stands (pixels) and where the dock ends.
    kid: { x: 350, y: 224 },
    dockEnd: 384,
    waterTop: 256,
    fish: ["minnow", "bluegill", "perch", "boot", "catfish", "bass", "goldencarp"],
  },
};

// The world map. Add a spot here, give it a `level`, and it shows up!
export const WORLD = {
  map: [
    "ooooooooooooooooooooooooo",
    "ooooooooooooooooooooooooo",
    "ooooffffooooooooooooooooo",
    "oooffffffoooooooooooooooo",
    "ooffffffffoooooooooooSSoo",
    "ooffffffffffoooooooSSSSSo",
    "oooffffffffooooooooSSSSSo",
    "ooooffffffoooooooooooSSoo",
    "ooooofffffooooooooooooooo",
    "ooooooffooooooooooooooooo",
    "ooooooooooooooooooooooooo",
    "ooooooooooooooooooooooooo",
    "ooooooooooooooooooooooooo",
    "ooooooooooooooooooooooooo",
  ],
  spots: [
    { id: "shop", name: "The Shop", col: 5, row: 3, icon: "icon_shop", scene: "Shop" },
    { id: "dock", name: "The Old Dock", col: 7, row: 8, icon: "icon_dock", scene: "Fish", level: "dock" },
    {
      id: "lake",
      name: "Sunny Lake",
      col: 21,
      row: 5,
      icon: "icon_boat",
      scene: "Fish",
      level: "lake", // not built yet! Add it to LEVELS above.
      locked: "You need a boat to get here!",
      unlocked: (save) => save.boat,
    },
  ],
};
