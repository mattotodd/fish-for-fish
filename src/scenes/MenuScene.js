import { Scene } from "phaser";
import { LEVELS } from "../levels.js";
import { drawTiles, text } from "../draw.js";
import { hasSave, newGame } from "../save.js";
import { sfx } from "../sound.js";

export class MenuScene extends Scene {
  constructor() {
    super("Menu");
  }

  create() {
    const level = LEVELS.dock;
    this.cameras.main.setBackgroundColor(level.sky);
    drawTiles(this, level.map);
    this.add.image(level.kid.x, level.kid.y, "kid").setOrigin(0.5, 1);

    const title = text(this, 400, 90, "GONE FISHING!", { fontSize: "52px", color: "#ffe066", strokeThickness: 8 });
    title.setOrigin(0.5);
    this.tweens.add({ targets: title, y: 100, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });

    const play = text(this, 400, 150, hasSave() ? "Press SPACE to continue" : "Press SPACE to play", { fontSize: "22px" });
    play.setOrigin(0.5);
    this.tweens.add({ targets: play, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

    const small = { fontSize: "13px" };
    text(this, 400, 420, "M = music on/off", small).setOrigin(0.5);
    this.wipe = hasSave() ? text(this, 400, 400, "N = start a new game", small).setOrigin(0.5) : null;

    this.askedToWipe = false;
    this.input.keyboard.on("keydown-SPACE", () => {
      sfx.select();
      this.scene.start("Map");
    });
    this.input.keyboard.on("keydown-N", () => {
      if (!hasSave()) return;
      if (!this.askedToWipe) {
        this.askedToWipe = true;
        this.wipe.setText("Erase everything? Press N again").setColor("#ff8080");
        return;
      }
      newGame();
      this.scene.restart();
    });
  }
}
