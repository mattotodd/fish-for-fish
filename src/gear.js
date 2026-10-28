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
// Fish have a `likes` list in fish.js: they go for their favorite bait 3 times as often.
export const BAITS = {
  bread: { name: "Bread", price: 0, pack: 0, biteSpeed: 1 },
  corn: { name: "Corn", price: 3, pack: 10, biteSpeed: 1.2 },
  worm: { name: "Worms", price: 6, pack: 10, biteSpeed: 1.6 },
  cricket: { name: "Crickets", price: 12, pack: 10, biteSpeed: 1.8 },
  shrimp: { name: "Shrimp", price: 20, pack: 10, biteSpeed: 2 },
  livebait: { name: "Live Minnows", price: 35, pack: 10, biteSpeed: 2.2 },
  glowbug: { name: "Glow Bugs", price: 50, pack: 10, biteSpeed: 2.5 },
  squid: { name: "Squid", price: 80, pack: 10, biteSpeed: 3 },
  lure: { name: "Lucky Lure", price: 300, pack: 5, biteSpeed: 4, luck: 3 },
};

//   speed     how fast you drive (pixels per second)
//   art       side view when you fish from it   deckRow: which row of the art is the deck
//   topArt    the little boat you drive around on the water map
// Better boats open bigger water: Little Boat = pond, Fishing Boat = lake, Powerboat = ocean.
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
];
