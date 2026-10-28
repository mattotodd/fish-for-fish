// Controller support. A controller presses the same keys the keyboard would, so every scene
// works with either one and nothing else needs to know about gamepads.
//
// Standard layout (Xbox style, and 8BitDo in its Switch/Xbox modes):
//   D-pad or left stick  arrow keys     A (bottom button)  SPACE     B (right button)  ESC
//   Y (top button) or Start  M          X (left button)    N

const KEYS = {
  up: { key: "ArrowUp", code: "ArrowUp", keyCode: 38 },
  down: { key: "ArrowDown", code: "ArrowDown", keyCode: 40 },
  left: { key: "ArrowLeft", code: "ArrowLeft", keyCode: 37 },
  right: { key: "ArrowRight", code: "ArrowRight", keyCode: 39 },
  space: { key: " ", code: "Space", keyCode: 32 },
  esc: { key: "Escape", code: "Escape", keyCode: 27 },
  m: { key: "m", code: "KeyM", keyCode: 77 },
  n: { key: "n", code: "KeyN", keyCode: 78 },
};

// Which controller buttons press which key. Change these to remap.
const BUTTONS = { 0: "space", 1: "esc", 2: "n", 3: "m", 9: "m", 12: "up", 13: "down", 14: "left", 15: "right" };
const STICK_DEADZONE = 0.5;
const REPEAT_DELAY = 400; // ms before a held direction starts repeating, like a keyboard
const REPEAT_EVERY = 120;

// Words in on-screen hints, as they should read when you are using a controller.
const PAD_WORDS = { SPACE: "A", ESC: "B", ARROWS: "D-PAD", "M =": "Y =", "N =": "X =" };

export const input = { pad: false }; // true once a controller has been used more recently than the keyboard

// Swaps keyboard words in a hint for controller buttons, if a controller is what you're using.
export function hint(message) {
  if (!input.pad) return message;
  return message
    .replace(/\b(SPACE|ESC|ARROWS|M =|N =)(?=\s|:|!|$)/g, (word) => PAD_WORDS[word])
    .replace("Press N", "Press X");
}

const pressed = new Map(); // key name -> when it should repeat next (ms), for keys the controller is holding

function send(type, name, repeat = false) {
  const { key, code, keyCode } = KEYS[name];
  const event = new KeyboardEvent(type, { key, code, repeat, bubbles: true, cancelable: true });
  // Phaser reads keyCode, which not every browser lets you set through the constructor.
  Object.defineProperty(event, "keyCode", { get: () => keyCode });
  window.dispatchEvent(event);
}

function wanted() {
  const names = new Set();
  let pads = [];
  try {
    pads = navigator.getGamepads?.() ?? [];
  } catch {
    // Some browsers block this on pages that aren't secure; just carry on with the keyboard.
  }
  for (const pad of pads) {
    if (!pad || !pad.connected) continue;
    pad.buttons.forEach((button, i) => button.pressed && BUTTONS[i] && names.add(BUTTONS[i]));
    const [x = 0, y = 0] = pad.axes;
    if (x < -STICK_DEADZONE) names.add("left");
    if (x > STICK_DEADZONE) names.add("right");
    if (y < -STICK_DEADZONE) names.add("up");
    if (y > STICK_DEADZONE) names.add("down");
  }
  return names;
}

function poll(time) {
  const names = wanted();
  for (const name of names) {
    if (!pressed.has(name)) {
      input.pad = true;
      pressed.set(name, time + REPEAT_DELAY);
      send("keydown", name);
    } else if (["up", "down", "left", "right"].includes(name) && time >= pressed.get(name)) {
      pressed.set(name, time + REPEAT_EVERY);
      send("keydown", name, true);
    }
  }
  for (const name of [...pressed.keys()]) {
    if (!names.has(name)) {
      pressed.delete(name);
      send("keyup", name);
    }
  }
  requestAnimationFrame(poll);
}

export function startGamepad() {
  // A real keypress means you went back to the keyboard. Our own pretend keys aren't trusted events.
  window.addEventListener("keydown", (e) => e.isTrusted && (input.pad = false));
  window.addEventListener("gamepadconnected", () => (input.pad = true));
  requestAnimationFrame(poll);
}
