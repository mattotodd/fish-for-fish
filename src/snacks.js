// Snacks from the Snack Shack. Eating one gives a boost for the next few casts.
//   casts     how many casts the boost lasts
//   bite      fish find your bait this many times faster
//   strength  your line is this many times stronger
//   reel      you reel this many times faster
//   luck      rare fish bite this many times more often
//   icon      the picture on the shelf (see ITEM_ART in tiles.js)
export const SNACKS = {
  apple: { name: "Apple", price: 5, casts: 10, bite: 1.5, icon: "snack_apple", blurb: "Fish bite 1.5x faster" },
  soda: { name: "Fizzy Soda", price: 12, casts: 10, reel: 1.3, icon: "snack_soda", blurb: "Reel in 1.3x faster" },
  sandwich: { name: "Sandwich", price: 25, casts: 10, strength: 1.3, icon: "snack_sandwich", blurb: "Line is 1.3x stronger" },
  cookie: { name: "Lucky Cookie", price: 40, casts: 10, luck: 2, icon: "snack_cookie", blurb: "Rare fish bite 2x more" },
  hotdog: { name: "Hot Dog", price: 60, casts: 10, bite: 1.4, strength: 1.2, icon: "snack_hotdog", blurb: "Faster bites and a stronger line" },
  feast: {
    name: "Fisherman's Feast",
    price: 150,
    casts: 15,
    bite: 1.3,
    strength: 1.3,
    reel: 1.2,
    luck: 1.5,
    icon: "snack_feast",
    blurb: "A little of everything, for longer",
  },
  dragonfeast: {
    name: "Dragon Feast",
    price: 5000,
    casts: 25,
    bite: 2,
    strength: 2,
    reel: 1.5,
    luck: 3,
    icon: "snack_feast",
    blurb: "The best of everything, for 25 casts",
  },
};

// Everything your snacks are doing for you right now, multiplied together.
export function boost(buffs, stat) {
  return Object.keys(buffs).reduce((total, id) => total * (SNACKS[id]?.[stat] ?? 1), 1);
}
