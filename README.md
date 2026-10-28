# Fish 4 Fish

Run it: `npm install` then `npx vite` and open the address it prints.

## Controls
- Hold SPACE: charge a cast. Let go to cast. (Farther casts reach bigger fish.)
- DOWN: hook the fish when the bobber dips and "!" shows up
- LEFT: reel in. Let go when the fish pulls or the line snaps!
- UP: change bait. ESC: back to the map. M: music on/off.

### With a controller
Pair a Bluetooth controller to the computer, then press any button. The keyboard still works too.
The D-pad (or left stick) is the arrow keys, A is SPACE, B is ESC, Y is M and X is N (new game).
To change which button does what, edit `BUTTONS` in `src/gamepad.js`. The game only ever sees key presses,
so new scenes work with a controller without any extra code.

## Change the game by typing
| File | What's in it |
| --- | --- |
| `src/fish.js` | Every fish: price, size, how far out it lives, how hard it fights, and its pixel art |
| `src/gear.js` | Rods, bait and the boat, with prices and stats |
| `src/levels.js` | Level maps (one letter = one 32px block) and the world map |
| `src/tiles.js` | Pixel art for blocks, the kid, and map icons |
| `src/art.js` | The color palette (letter -> color) |

### Places
| Place | You need | Spots |
| --- | --- | --- |
| The Old Dock | nothing | the dock |
| Sunny Pond | Little Boat | Reed Bank, Lily Pads, Middle of the Pond |
| Big Lake | Fishing Boat | Pine Shallows, Rocky Reef, Deep Water |
| The Ocean | Powerboat | Coral Reef, Shipwreck, Open Sea, The Deep Trench |

### Add a new fishing spot or place
1. A fishing view is an entry in `LEVELS` (`src/levels.js`). Copy one, give it a new key, and edit its `map` and `fish`.
2. A place you drive around is an entry in `SAILS`. Each `spot` points at one of your `LEVELS`.
3. To put a place on the world map, add it to `WORLD.spots` and choose what unlocks it.
4. Fish marked `legendary: true` get a big celebration and a trophy.

Saves live in the browser's localStorage. To start over, press N on the title screen.
