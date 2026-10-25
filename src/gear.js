// Things you can buy at the shop.
//   strength  how much pull the line takes before it snaps
//   reel      how fast you reel
//   range     how far you can cast, in pixels (farther water has better fish)
export const RODS = [
  { name: "Stick Rod", price: 0, strength: 1.0, reel: 0.22, range: 170, len: 62 },
  { name: "Bamboo Rod", price: 40, strength: 1.3, reel: 0.26, range: 230, len: 72 },
  { name: "Fiberglass Rod", price: 150, strength: 1.7, reel: 0.32, range: 290, len: 82 },
  { name: "Pro Carbon Rod", price: 400, strength: 2.2, reel: 0.4, range: 350, len: 92 },
];

//   biteSpeed  bigger = fish find it faster
//   pack       how many you get per purchase (bread is free and never runs out)
export const BAITS = {
  bread: { name: "Bread", price: 0, pack: 0, biteSpeed: 1 },
  worm: { name: "Worms", price: 6, pack: 10, biteSpeed: 1.6 },
  shrimp: { name: "Shrimp", price: 20, pack: 10, biteSpeed: 2 },
  glowbug: { name: "Glow Bugs", price: 50, pack: 10, biteSpeed: 2.5 },
};

export const BOAT = { name: "Little Boat", price: 800 };
