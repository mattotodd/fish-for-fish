# Gone Fishing!

Run it: `npm install` then `npx vite` and open the address it prints.

## Controls
- Hold SPACE: charge a cast. Let go to cast. (Farther casts reach bigger fish.)
- DOWN: hook the fish when the bobber dips and "!" shows up
- LEFT: reel in. Let go when the fish pulls or the line snaps!
- UP: change bait. ESC: back to the map. M: music on/off.

## Change the game by typing
| File | What's in it |
| --- | --- |
| `src/fish.js` | Every fish: price, size, how far out it lives, how hard it fights, and its pixel art |
| `src/gear.js` | Rods, bait and the boat, with prices and stats |
| `src/levels.js` | Level maps (one letter = one 32px block) and the world map |
| `src/tiles.js` | Pixel art for blocks, the kid, and map icons |
| `src/art.js` | The color palette (letter -> color) |

### Add a new fishing spot
1. Copy the `dock` entry in `LEVELS` (`src/levels.js`), give it a new key like `lake`, and edit its `map` and `fish`.
2. The world map already has a locked "Sunny Lake" spot whose `level` is `"lake"`. Buy the boat in the shop and it opens.

Saves live in the browser's localStorage. To start over, press N on the title screen.
