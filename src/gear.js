// Things you can buy at the shop.
//   strength  how much pull the line takes before it snaps
//   reel      how fast you reel
//   range     how far you can cast, in pixels (farther water has better fish)
//   color     the color of the rod ("rainbow" cycles through all of them)
// Keep the rods in order from cheapest to best: the shop sells them one after another.
export const RODS = [
  { name: "Stick Rod", price: 0, strength: 1.0, reel: 0.22, range: 170, len: 62, color: 0x5a3a1e },
  { name: "Bamboo Rod", price: 40, strength: 1.3, reel: 0.26, range: 230, len: 72, color: 0xd9b382 },
  { name: "Fiberglass Rod", price: 150, strength: 1.7, reel: 0.32, range: 290, len: 82, color: 0xe0e6ec },
  { name: "Graphite Rod", price: 250, strength: 1.9, reel: 0.36, range: 320, len: 86, color: 0x7a8591 },
  { name: "Pro Carbon Rod", price: 400, strength: 2.2, reel: 0.4, range: 350, len: 92, color: 0x222222 },
  { name: "Lake Master Rod", price: 800, strength: 2.5, reel: 0.44, range: 375, len: 96, color: 0x3a5fd9 },
  { name: "Ocean Rod", price: 1500, strength: 2.8, reel: 0.48, range: 400, len: 100, color: 0xd93a3a },
  { name: "Deep Sea Rod", price: 2200, strength: 3.2, reel: 0.52, range: 420, len: 104, color: 0x2e7d32 },
  { name: "Big Game Rod", price: 3500, strength: 3.6, reel: 0.56, range: 440, len: 108, color: 0xe8883a },
  { name: "Golden Rod", price: 7500, strength: 4.4, reel: 0.64, range: 440, len: 114, color: 0xf2c94c },
  { name: "Rainbow Rod", price: 15000, strength: 5.4, reel: 0.78, range: 440, len: 120, color: "rainbow" },
];

//   biteSpeed  bigger = fish find it faster
//   pack       how many you get per purchase (bread is free and never runs out)
//   luck       (optional) multiplies how often the rare fish bite
//   favorite   (optional) how much more the fish that like it go for it (the usual is 3)
//   color      the color of the jar on the bait shop shelf
// Fish have a `likes` list in fish.js: they go for their favorite bait 3 times as often.
export const BAITS = {
  bread: { name: "Bread", price: 0, pack: 0, biteSpeed: 1, color: 0xe8c898 },
  corn: { name: "Corn", price: 3, pack: 10, biteSpeed: 1.2, color: 0xf2c94c },
  worm: { name: "Worms", price: 6, pack: 10, biteSpeed: 1.6, color: 0xc46a5a },
  cricket: { name: "Crickets", price: 12, pack: 10, biteSpeed: 1.8, color: 0x4a7a2a },
  shrimp: { name: "Shrimp", price: 20, pack: 10, biteSpeed: 2, color: 0xff9a6a },
  livebait: { name: "Live Minnows", price: 35, pack: 10, biteSpeed: 2.2, color: 0xa8c8e8 },
  glowbug: { name: "Glow Bugs", price: 50, pack: 10, biteSpeed: 2.5, color: 0xb8ff40 },
  squid: { name: "Squid", price: 80, pack: 10, biteSpeed: 3, color: 0xa060d0 },
  chicken: { name: "Raw Chicken", price: 120, pack: 10, biteSpeed: 3.4, color: 0xe0b070 },
  lure: { name: "Lucky Lure", price: 300, pack: 5, biteSpeed: 4, luck: 3, color: 0xff4040 },
  monsterbait: { name: "Monster Bait", price: 20000, pack: 3, biteSpeed: 5, luck: 10, favorite: 60, color: 0xff3fb0 },
};

//   speed     how fast you drive (pixels per second)
//   art       side view when you fish from it   deckRow: which row of the art is the deck
//   topArt    the little boat you drive around on the water map
// Better boats open bigger water: Little Boat = pond, Fishing Boat = lake, Powerboat = ocean,
// Airboat = the Deep Zone swamp, Submarine = the Sunken City, Lava Hoverboat = Volcano Island.
export const BOATS = [
  {
    name: "Little Boat",
    price: 800,
    speed: 110,
    deckRow: 0,
    art: [
      "nnnnnnnnnnnnnnnnnnnnnn",
      ".nnttnnnnnnnnnnnnttnn.",
      "..mnnnnnnnnnnnnnnnnm..",
      "...mmmmmmmmmmmmmmmm...",
    ],
    topArt: [
      "..mmmmmmm....",
      ".mtttttttmm..",
      "mttttttttttmm",
      ".mtttttttmm..",
      "..mmmmmmm....",
    ],
  },
  {
    name: "Fishing Boat",
    price: 1500,
    speed: 150,
    deckRow: 3,
    art: [
      ".....wwwwww..............",
      ".....wllllw..............",
      ".....wllllw..............",
      "bbbbbbbbbbbbbbbbbbbbbbbbbb",
      ".bwbbbbbbbbbbbbbbbbbbbbwb.",
      "..bbbbbbbbbbbbbbbbbbbbbb..",
      "...bbbbbbbbbbbbbbbbbbbb...",
    ],
    topArt: [
      "..bbbbbbbbbbb....",
      ".bwwwwwwwwwwbb...",
      "bwwwwllllwwwwwbb.",
      "bwwwwllllwwwwwwbb",
      "bwwwwllllwwwwwbb.",
      ".bwwwwwwwwwwbb...",
      "..bbbbbbbbbbb....",
    ],
  },
  {
    name: "Powerboat",
    price: 4000,
    speed: 210,
    deckRow: 3,
    art: [
      "....wwwwwwww................",
      "....wllllllw................",
      "....wllllllw................",
      "wwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
      ".wrrrrrrrrrrrrrrrrrrrrrrrrrrw.",
      "..wwwwwwwwwwwwwwwwwwwwwwwwww..",
      "...eeeeeeeeeeeeeeeeeeeeeeee...",
      "....eeeeeeeeeeeeeeeeeeeeee....",
    ],
    topArt: [
      "..wwwwwwwwwwww......",
      ".wwwwwwwwwwwwwww....",
      "wwwwlllllwwwwwwwww..",
      "wrrrlllllwwwwwwwwwww",
      "wwwwlllllwwwwwwwww..",
      ".wwwwwwwwwwwwwww....",
      "..wwwwwwwwwwww......",
    ],
  },
  {
    name: "Airboat",
    price: 9000,
    speed: 230,
    deckRow: 3,
    art: [
      "..aa..........................",
      ".aeea.........................",
      ".aeea.........................",
      "ddddddddddddddddddddddddddddd.",
      ".dggggggggggggggggggggggggd...",
      "..ddddddddddddddddddddddd.....",
      "...mmmmmmmmmmmmmmmmmmmmm......",
    ],
    topArt: [
      "..aa..ddddddd...",
      ".aeea.dgggggddd.",
      ".aeea.dgggggggdd",
      ".aeea.dgggggddd.",
      "..aa..ddddddd...",
    ],
  },
  {
    name: "Submarine",
    price: 60000,
    speed: 280,
    deckRow: 3,
    art: [
      "..........kk................",
      "..........k.................",
      "........yyyyyy..............",
      "yyyyyyyyyyyyyyyyyyyyyyyyyyyyy",
      ".yoooooooooooooooooooooooooy.",
      "..yyyyyyyyyyyyyyyyyyyyyyyyy..",
      "...oooooooooooooooooooooo....",
    ],
    topArt: [
      "..yyyyyyyyyyyy....",
      ".kyyyyyyyyyyyyyy..",
      "kkyylyyyyyyyyyyyyy",
      ".kyyyyyyyyyyyyyy..",
      "..yyyyyyyyyyyy....",
    ],
  },
  {
    name: "Lava Hoverboat",
    price: 250000,
    speed: 330,
    deckRow: 3,
    art: [
      "..........oo................",
      ".........ooyo...............",
      "........rrrrrr..............",
      "rrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
      ".rwwwwwwwwwwwwwwwwwwwwwwwwwr.",
      "..rrrrrrrrrrrrrrrrrrrrrrrrr..",
      "...yoyoyoyoyoyoyoyoyoyoyo....",
    ],
    topArt: [
      "..rrrrrrrrrrrr....",
      ".orrrrrrrrrrrrrr..",
      "ooyyrrrrrrrrrrrrrr",
      ".orrrrrrrrrrrrrr..",
      "..rrrrrrrrrrrr....",
    ],
  },
];
