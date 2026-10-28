// Levels are text maps: each character is one 32-pixel block.
//   .  sky     c  cloud    L  leaves   Y  tree trunk   T  pine tree   M  mountain
//   G  grass   D  dirt     =  dock     |  dock post    R  reeds
//   ~  water surface       o  water    O  deep water   P  lily pads    K  rock
//   A  palm tree    C  coral    X  shipwreck    S  sand
//   a  sunken column  e  sunken wall  k  kelp  b  broken pillar (the Sunken City)
//   W  swamp water  V  deep swamp water    Z  cypress tree (z on mud)    B  mud bank    J  mangrove roots
// The village and the shop insides use 1-4 (roofs) w (wall) d (door) p (path) F (floor) H (wall) N (shelf) U (counter).
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
// The swamp: rows 0-3 sky, 4-5 and 6 trees, 7 muddy bank, 8-13 water.
const SWAMP_WATER = ["W".repeat(25), "W".repeat(25), "W".repeat(25), "V".repeat(25), "V".repeat(25), "V".repeat(25)];
const DEEP_SWAMP = ["W".repeat(25), ...Array(5).fill("V".repeat(25))];
// The Sunken City: sky, a few broken pillars on the horizon, then water with ruins on the sea floor.
const CITY_SKY = [".........................", ".......cc........ccc.....", "......cccc......cc.......", ".........................", "..cc...............cc....", ".ccc..............ccc...."];
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
    fish: ["minnow", "bluegill", "perch", "catfish", "bass", "goldencarp"],
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
    fish: ["frog", "minnow", "bluegill", "perch", "turtle"],
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
    fish: ["frog", "bluegill", "perch", "turtle", "bass", "catfish"],
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
    fish: ["perch", "catfish", "bass", "trout", "pike", "goldencarp"],
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
    fish: ["perch", "bass", "pike", "walleye", "trout"],
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
    fish: ["bass", "pike", "walleye", "catfish", "salmon"],
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
    fish: ["trout", "pike", "walleye", "salmon", "sturgeon", "giantsturgeon"],
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
    fish: ["mackerel", "snapper", "mahi", "treasure"],
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
    fish: ["snapper", "mahi", "tuna", "shark", "treasure"],
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
    fish: ["mackerel", "mahi", "tuna", "swordfish"],
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
    fish: ["tuna", "mahi", "swordfish", "shark", "giantsquid"],
  },

  // ---- the Deep Zone (you need the Airboat) ----
  swamp_mangrove: {
    ...BOAT_VIEW,
    name: "Mangrove Maze",
    sky: 0x8aa890,
    map: [
      ".........................",
      ".........................",
      ".........................",
      ".........................",
      ".........................",
      "Z.Z..Z..Z.Z..Z.Z..Z.Z.Z.Z",
      "ZZZ.ZZZ.ZZ.Z.ZZZ.ZZ.ZZZ.Z",
      "JJBJJJBJJBJJJJBJJJBJJBJJJ",
      ...SWAMP_WATER,
    ],
    fish: ["frog", "bullfrog", "watersnake", "snapturtle", "catfish", "gar"],
  },
  swamp_bayou: {
    ...BOAT_VIEW,
    name: "Gator Bayou",
    sky: 0x7f9a86,
    map: [
      ".........................",
      ".........................",
      ".........................",
      ".........................",
      "..Z.......Z.......Z....Z.",
      "Z..ZZ.Z...Z.ZZ..Z..ZZ.Z..",
      "ZZ.ZZZ.ZZ.ZZZZ.ZZ..ZZZ.ZZ",
      "BBBBBBBBBBBBBBBBBBBBBBBBB",
      ...SWAMP_WATER,
    ],
    fish: ["bullfrog", "watersnake", "cottonmouth", "snapturtle", "gar", "alligator"],
  },
  swamp_black: {
    ...BOAT_VIEW,
    name: "Black Water",
    sky: 0x5f7568,
    map: [
      ".........................",
      ".........................",
      ".........................",
      ".........................",
      ".........................",
      "...Z.........Z.........Z.",
      "BBZZBBBBZBBBBBBZZBBBBBZBB",
      "BBBBBBBBBBBBBBBBBBBBBBBBB",
      ...DEEP_SWAMP,
    ],
    fish: ["cottonmouth", "gar", "eel", "alligator", "crocodile"],
  },
  swamp_heart: {
    ...BOAT_VIEW,
    name: "Heart of the Swamp",
    sky: 0x3f4f4c,
    map: [
      ".........................",
      ".........................",
      "...Z.........Z.......Z...",
      "Z.ZZ..ZZ.Z.ZZ..Z.ZZ.Z.ZZ.",
      "ZZZZ.ZZZZZZ.ZZZ.ZZZZ.ZZZZ",
      "ZZZZZZZZZZZZZZZZZZZZZZZZZ",
      "ZZZBZZZZBZZZZZZBZZZZBZZZZ",
      "BBBBBBBBBBBBBBBBBBBBBBBBB",
      ...DEEP_SWAMP,
    ],
    fish: ["eel", "alligator", "crocodile", "python", "ghostgator", "seamonster"],
  },
  // ---- the Sunken City (you need the Submarine) ----
  city_gate: {
    ...BOAT_VIEW,
    name: "Sunken Gate",
    sky: 0x6a7ab8,
    map: [
      ...CITY_SKY,
      ".........................",
      "...b........b.......b....",
      "~~~~~~~~~~~~~~~~~~~~~~~~~",
      "ooooooooooooooooooooooooo",
      "ooooooooooooooooooooooooo",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OkOOaOOOOkOOeeOOOOkOOaOOk",
    ],
    fish: ["lanternfish", "pearlclam", "morayeel", "barracuda"],
  },
  city_temple: {
    ...BOAT_VIEW,
    name: "Drowned Temple",
    sky: 0x5a6aa8,
    map: [
      ...CITY_SKY,
      "....b.........b..........",
      "..b.b....b....b....b..b..",
      "~~~~~~~~~~~~~~~~~~~~~~~~~",
      "ooooooooooooooooooooooooo",
      "ooooooooooooooooooooooooo",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OOOOaOOOOOOaOOOOOOaOOOOOO",
      "OeeaeOkOOeeaeOkOOeeaeOkOO",
    ],
    fish: ["morayeel", "barracuda", "spidercrab", "pearlclam", "goldenidol"],
  },
  city_vault: {
    ...BOAT_VIEW,
    name: "Treasure Vault",
    sky: 0x4a5a98,
    map: [
      ...CITY_SKY,
      ".........................",
      ".b..b.b..b...b..b.b..b.b.",
      "~~~~~~~~~~~~~~~~~~~~~~~~~",
      "ooooooooooooooooooooooooo",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OaOOOOaOOOOaOOOOaOOOOaOOO",
      "eeeeeeeeeeeeeeeeeeeeeeeee",
    ],
    fish: ["spidercrab", "anglerfish", "mantaray", "goldenidol", "pearlclam"],
  },
  city_abyss: {
    ...BOAT_VIEW,
    name: "The Abyss",
    sky: 0x2a3a78,
    map: [
      ...CITY_SKY,
      ".........................",
      ".........................",
      "~~~~~~~~~~~~~~~~~~~~~~~~~",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OOkOOOOOaOOOOOOOOaOOOOOkO",
    ],
    fish: ["anglerfish", "mantaray", "ghostshark", "goldenidol", "kraken"],
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
  swamp: {
    name: "The Deep zone",
    map: [
      "BBBBBBBBBBBBBBBBBBBBBBBBB",
      "BBBWWWWWBBBBBBBBzBBWWWWBB",
      "BWWWWWWWWWBBJWWWWWWWWWWWB",
      "BWWWJWWWWWWWWWWWBBWWWWWWB",
      "BWWWWWWBBWWWWWWWWBBWWJWWB",
      "BBWWWWWWBBWWJWWWWWWWWWWBB",
      "BWWWWWWWWWWWWWWWWBBWWWWWB",
      "WWWWBBWWWWBBWWWWWWWBBWWWB",
      "WWWWWWWWWWBBWWWJWWWWWWWBB",
      "WWWWWWWWWWWWWWWWWWBBWWWWB",
      "BWWWBBWWWWJWWWWWBBWWWWWBB",
      "BBWWWWWWWWWWWWWWBBWWWWBBB",
      "BBBBWWWWWWBBBWWWWWWWBBBBB",
      "BBBBBBBBBBBBBBBBBBBBBBBBB",
    ],
    dock: { col: 0, row: 8 },
    start: { col: 1, row: 8 },
    spots: [
      { name: "Mangrove Maze", col: 5, row: 2, level: "swamp_mangrove" },
      { name: "Gator Bayou", col: 19, row: 3, level: "swamp_bayou" },
      { name: "Black Water", col: 11, row: 9, level: "swamp_black" },
      { name: "Heart of the Swamp", col: 20, row: 11, level: "swamp_heart" },
    ],
  },
  city: {
    name: "The Sunken City",
    map: [
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
      "OooooooooeeooooooooooookO",
      "OoooooKoooaooooCooooooooO",
      "OkoooooooooooooooooeaoooO",
      "OooCooooookoooooooooooooO",
      "OoooooeeoooooooaooooooooO",
      "ooooooeaooooooooooooCoooO",
      "OoooooooooooeeooooooooooO",
      "OoooooooooooaoooookoooooO",
      "OooaoooooooooooooooooeeoO",
      "OoooooCooooooKoooooooeaoO",
      "OoooooooooookoooooooooooO",
      "OoooeeooooooooooCoooooooO",
      "OOOOOOOOOOOOOOOOOOOOOOOOO",
    ],
    dock: { col: 0, row: 6 },
    start: { col: 2, row: 6 },
    spots: [
      { name: "Sunken Gate", col: 5, row: 3, level: "city_gate" },
      { name: "Drowned Temple", col: 14, row: 5, level: "city_temple" },
      { name: "Treasure Vault", col: 12, row: 9, level: "city_vault" },
      { name: "The Abyss", col: 21, row: 7, level: "city_abyss" },
    ],
  },
};

// The village: you walk around it and step into the shops. Doors are the d blocks in row 4.
// Walkable: f (grass), p (path), d (door). Everything else is in the way.
export const TOWN = {
  map: [
    "TTfffffffffffffffffffffTT",
    "fffffffffffffffffffffffff",
    "f11111f22222f33333f44444f",
    "f11111f22222f33333f44444f",
    "fwwdwwfwwdwwfwwdwwfwwdwwf",
    "fpppppppppppppppppppppppf",
    "fpppppppppppppppppppppppf",
    "fffpppppppppppppppppppfff",
    "ffffffpppppppppppppffffff",
    "fffffffffffffffffffffffff",
    "TfffffffffffffffffffffffT",
    "fffffffffffffffffffffffff",
    "fTfffffffffffffffffffffTf",
    "TTfffffffffffffffffffffTT",
  ],
  start: { col: 12, row: 8 },
  doors: [
    { col: 3, row: 4, store: "bait", name: "Bait Shop" },
    { col: 9, row: 4, store: "tackle", name: "Tackle Shop" },
    { col: 15, row: 4, store: "snacks", name: "Snack Shack" },
    { col: 21, row: 4, store: "market", name: "Fish Market" },
  ],

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
    "ooBBBzooooSSSooooSSSSSSSo",
    "oBBBBBBooSSSSSooooSSSSSoo",
    "ooBBzBooooSSSoooooooooooo",
  ],
  spots: [
    { id: "town", name: "The Village", col: 5, row: 3, icon: "icon_shop", scene: "Town" },
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
    {
      id: "swamp",
      name: "The Deep Zone",
      col: 4,
      row: 12,
      icon: "icon_swamp",
      scene: "Sail",
      sail: "swamp",
      locked: "You need an airboat to get through the swamp!",
      unlocked: (save) => save.boat >= 4,
    },
    {
      id: "city",
      name: "The Sunken City",
      col: 15,
      row: 7,
      icon: "icon_city",
      scene: "Sail",
      sail: "city",
      locked: "You need a submarine to dive to the Sunken City!",
      unlocked: (save) => save.boat >= 5,
    },
  ],
};
