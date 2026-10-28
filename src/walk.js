// Walking around on foot (the village and the shop insides).
const SPEED = 130; // pixels per second
const HALF = 8; // half the width of the kid's feet, for bumping into things

// Moves `kid` with the arrow keys. `free(x, y)` says whether a spot is OK to stand on.
// Each direction is tried on its own so you slide along walls instead of sticking.
export function walk(kid, keys, dt, free) {
  let dx = (keys.right.isDown ? 1 : 0) - (keys.left.isDown ? 1 : 0);
  let dy = (keys.down.isDown ? 1 : 0) - (keys.up.isDown ? 1 : 0);
  if (!dx && !dy) return;
  const len = Math.hypot(dx, dy);
  dx = (dx / len) * SPEED * dt;
  dy = (dy / len) * SPEED * dt;
  const fits = (x, y) => free(x - HALF, y) && free(x + HALF, y);
  if (fits(kid.x + dx, kid.y)) kid.x += dx;
  if (fits(kid.x, kid.y + dy)) kid.y += dy;
  if (dx) kid.setFlipX(dx < 0);
}
