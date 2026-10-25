import { AUTO, Game, Scale } from "phaser";
import { BootScene } from "./scenes/BootScene.js";
import { MenuScene } from "./scenes/MenuScene.js";
import { MapScene } from "./scenes/MapScene.js";
import { ShopScene } from "./scenes/ShopScene.js";
import { FishScene } from "./scenes/FishScene.js";
import { startMusic, toggleMute } from "./sound.js";

// window.game lets you poke at the game from the browser console (try game.scene.getScene('Fish'))
window.game = new Game({
  type: AUTO,
  scale: { mode: Scale.FIT, width: 800, height: 448, parent: "game" },
  pixelArt: true, // keeps pixel art crisp
  backgroundColor: "#10202e",
  scene: [BootScene, MenuScene, MapScene, ShopScene, FishScene],
});

// Browsers only allow sound after you press something, so start the music on the first key.
window.addEventListener("keydown", (e) => {
  startMusic();
  if (e.key === "m" || e.key === "M") toggleMute();
});
