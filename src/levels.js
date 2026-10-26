// Levels are text maps: each character is one 32-pixel block.
//   .  sky     c  cloud    L  leaves   Y  tree trunk   T  pine tree   M  mountain
//   G  grass   D  dirt     =  dock     |  dock post    R  reeds
//   ~  water surface       o  water    O  deep water   P  lily pads    K  rock
//   A  palm tree    C  coral    X  shipwreck    S  sand
// The driving maps and the world map use f (flat grass), S (sand), o (water) and K (rock) too.

export const COLS = 25;
export const ROWS = 14;
export const TILE = 32;

// Pieces shared by the boat fishing views. Rows 0-5 are sky, 6-7 are the far shore, 8-13 are water.
const SKY = [
  ".........................",
  "......cc............ccc..",
  ".....cccc..........cc....",
  ".........................",
  "...cc.................cc.",
  "..cccc................ccc",
];
const WATER = [
  "~~~~~~~~~~~~~~~~~~~~~~~~~",
  "ooooooooooooooooooooooooo",
  "ooooooooooooooooooooooooo",
  "OOOOOOOOOOOOOOOOOOOOOOOOO",
  "OOOOOOOOOOOOOOOOOOOOOOOOO",
  "OOOOOOOOOOOOOOOOOOOOOOOOO",
];
const DEEP = ["~".repeat(25), ...Array(5).fill("O".repeat(25))];
// Fishing from a boat: the kid stands on the boat, and casts are measured from its right edge.
const BOAT_VIEW = { onBoat: true, kid: { x: 274, y: 250 }, dockEnd: 300, waterTop: 256 };

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

  // ---- the pond (you need the Little Boat) ----
  pond_reeds: {
    ...BOAT_VIEW,
    name: "Reed Bank",
    sky: 0x9be0ff,
    map: [
      ...SKY,
      ".........................",
      "GGRGGGRRGGGGGRGGGGGGRGGGG",
      ...WATER,
    ],
    fish: ["frog", "minnow", "bluegill", "perch", "turtle", "boot"],
  },
  pond_lilies: {
    ...BOAT_VIEW,
    name: "Lily Pads",
    sky: 0x9be0ff,
    map: [
      ...SKY,
      ".........................",
      "GGGGGGGGGGGGGGGGGGGGGGGGG",
      "P~~P~~~~~PP~~~~~P~~~~P~~P",
      ...WATER.slice(1),
    ],
    fish: ["frog", "bluegill", "perch", "turtle", "bass", "catfish", "boot"],
  },
  pond_deep: {
    ...BOAT_VIEW,
    name: "Middle of the Pond",
    sky: 0x9be0ff,
    map: [
      ...SKY,
      ".........................",
      ".........................",
      ...WATER,
    ],
    fish: ["perch", "catfish", "bass", "trout", "pike", "goldencarp", "boot"],
  },

  // ---- the lake (you need the Fishing Boat) ----
  lake_shallows: {
    ...BOAT_VIEW,
    name: "Pine Shallows",
    sky: 0x7fbfe8,
    map: [
      ...SKY,
      "..T..TT...T.....TT..T..T.",
      "GGGGGGGGGGGGGGGGGGGGGGGGG",
      ...WATER,
    ],
    fish: ["perch", "bass", "pike", "walleye", "trout", "boot"],
  },
  lake_rocks: {
    ...BOAT_VIEW,
    name: "Rocky Reef",
    sky: 0x7fbfe8,
    map: [
      ...SKY,
      ".........................",
      "..MM...MMM......MMM....MM",
      "~~K~~~~~K~~~~K~~~~~K~~~~~",
      "ooooKoooooooooKooooooKooo",
      ...WATER.slice(2),
    ],
    fish: ["bass", "pike", "walleye", "catfish", "salmon", "boot"],
  },
  lake_deep: {
    ...BOAT_VIEW,
    name: "Deep Water",
    sky: 0x7fbfe8,
    map: [
      ...SKY,
      ".........................",
      "..MMM.MM...MMMM...M.MM...",
      ...WATER,
    ],
    fish: ["trout", "pike", "walleye", "salmon", "sturgeon", "giantsturgeon", "boot"],
  },

  // ---- the ocean (you need the Powerboat) ----
  ocean_reef: {
    ...BOAT_VIEW,
    name: "Coral Reef",
    sky: 0x7fd8f0,
    map: [
      ...SKY,
      "..A....A.A......A....A...",
      "SSSSSSSSSSSSSSSSSSSSSSSSS",
      ...WATER.slice(0, 5),
      "OOCOOOOCCOOOOCOOOOOCOOOOC",
    ],
    fish: ["mackerel", "snapper", "mahi", "treasure", "boot"],
  },
  ocean_wreck: {
    ...BOAT_VIEW,
    name: "Shipwreck",
    sky: 0x8aa0b8,
    map: [
      ...SKY,
      ".........................",
      "..........X......X.......",
      "~~K~~~~~~~~~~K~~~~~~~~K~~",
      ...WATER.slice(1),
    ],
    fish: ["snapper", "mahi", "tuna", "shark", "treasure", "boot"],
  },
  ocean_open: {
    ...BOAT_VIEW,
    name: "Open Sea",
    sky: 0x6fb8e8,
    map: [
      ...SKY,
      ".........................",
      ".........................",
      ...WATER,
    ],
    fish: ["mackerel", "mahi", "tuna", "swordfish", "boot"],
  },
  ocean_trench: {
    ...BOAT_VIEW,
    name: "The Deep Trench",
    sky: 0x4a5a8a,
    map: [
      ...SKY,
      ".........................",
      ".........................",
      ...DEEP,
    ],
    fish: ["tuna", "mahi", "swordfish", "shark", "giantsquid", "boot"],
  },
};

// Driving maps. You steer the boat around on the water (o) and can't cross land (f) or rocks (K).
// Each spot is a place to stop and fish: give it a col, a row and one of the LEVELS above.
export const SAILS = {
  pond: {
    name: "Sunny Pond",
    map: [
      "fffffffffffffffffffffffff",
      "fffffffffffffffffffffffff",
      "ffffffffoooooooooffffffff",
      "fffffooooooooKoooooofffff",
      "fffoooooooKooooooooooofff",
      "ffoooooooooooooooooooooff",
      "ffooooooKooooooooooooooff",
      "fooooooooooooooooooooooof",
      "ffooooooooooooooooooKooff",
      "ffooooKooooooooooooooooff",
      "fffooooooooooooKoooooofff",
      "fffffooooooooooooooofffff",
      "ffffffffoooooooooffffffff",
      "fffffffffffffffffffffffff",
    ],
    dock: { col: 2, row: 10 },
    start: { col: 3, row: 9 },
    spots: [
      { name: "Reed Bank", col: 4, row: 4, level: "pond_reeds" },
      { name: "Lily Pads", col: 18, row: 5, level: "pond_lilies" },
      { name: "Middle of the Pond", col: 12, row: 8, level: "pond_deep" },
    ],
  },
  lake: {
    name: "Big Lake",
    map: [
      "fffffffffffffffffffffffff",
      "ffffffffoooooooooffffffff",
      "fffffooooooooooooooofffff",
      "fffooooooooooooooooooofff",
      "ffooooooooooooKooooooooff",
      "fooooooooooooooooooooKoof",
      "fooooooooooooooooooooooof",
      "foooooKoooooooooooKooooof",
      "foooooooooKooooooooooooof",
      "fooooooooooooooooooooooof",
      "ffooKoooKooooooooooooooff",
      "fffoooooooooooooKooooofff",
      "fffffooooooooooooooofffff",
      "ffffffffoooooooooffffffff",
    ],
    dock: { col: 0, row: 9 },
    start: { col: 1, row: 9 },
    spots: [
      { name: "Pine Shallows", col: 4, row: 4, level: "lake_shallows" },
      { name: "Rocky Reef", col: 19, row: 10, level: "lake_rocks" },
      { name: "Deep Water", col: 12, row: 6, level: "lake_deep" },
    ],
  },
  ocean: {
    name: "The Ocean",
    map: [
      "fffooooooooooooooooSSSSSS",
      "fffooooooooooooooooSSSSSS",
      "fffooooooooooooooooSSSSSS",
      "fffoooooooooKoooooooooSoo",
      "ffooooooooooooooooooooooo",
      "ffooKoooooooooooooooooooo",
      "ffoooooooKooooooKooooooKo",
      "ffooooooooooooooooooooooo",
      "ffoooooooooooooooooKooooo",
      "ffoooKooooooooooooooooooo",
      "fffoooooooKoooooooooooooo",
      "fffooooKoooooooKooooooooo",
      "fffoooooSSSSSoooooooooooo",
      "fffooooSSSSSSSooooooooooo",
    ],
    dock: { col: 1, row: 7 },
    start: { col: 3, row: 7 },
    spots: [
      { name: "Coral Reef", col: 6, row: 3, level: "ocean_reef" },
      { name: "Shipwreck", col: 13, row: 8, level: "ocean_wreck" },
      { name: "Open Sea", col: 18, row: 4, level: "ocean_open" },
      { name: "The Deep Trench", col: 21, row: 11, level: "ocean_trench" },
    ],
  },
};

// The world map. Add a spot here and it shows up!
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
    "ooooooooooooooooooSSSSSoo",
    "ooooooooooSSSooooSSSSSSSo",
    "oooooooooSSSSSooooSSSSSoo",
    "ooooooooooSSSoooooooooooo",
  ],
  spots: [
    { id: "shop", name: "The Shop", col: 5, row: 3, icon: "icon_shop", scene: "Shop" },
    { id: "dock", name: "The Old Dock", col: 7, row: 8, icon: "icon_dock", scene: "Fish", level: "dock" },
    {
      id: "pond",
      name: "Sunny Pond",
      col: 21,
      row: 5,
      icon: "icon_pond",
      scene: "Sail",
      sail: "pond",
      locked: "You need a boat to get here!",
      unlocked: (save) => save.boat >= 1,
    },
    {
      id: "lake",
      name: "Big Lake",
      col: 20,
      row: 11,
      icon: "icon_lake",
      scene: "Sail",
      sail: "lake",
      locked: "You need a bigger boat to cross the lake!",
      unlocked: (save) => save.boat >= 2,
    },
    {
      id: "ocean",
      name: "The Ocean",
      col: 11,
      row: 12,
      icon: "icon_ocean",
      scene: "Sail",
      sail: "ocean",
      locked: "You need a powerboat to go out to sea!",
      unlocked: (save) => save.boat >= 3,
    },
  ],
};
