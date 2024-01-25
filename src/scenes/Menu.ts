import Phaser from "phaser";

export default class Menu extends Phaser.Scene {
  window!: Phaser.GameObjects.Rectangle;
  text!: Phaser.GameObjects.Text;
  state: string = "none";
  constructor() {
    super("Menu");
  }

  create() {
    console.log("Menu");
    this.window = this.add.rectangle(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      1000,
      500,
      0xffffff,
      0.9
    );

    this.text = this.add.text(this.window.x, this.window.y, "Start", {
      color: "black",
    });

    this.input.on("pointerdown", this.startGame);
  }

  resume = () => {
    this.scene.resume("Game");
  };

  startGame = () => {
    // this.sound.locked = false;
    // this.scene.pause();
    this.state = "init";
    if (this.state === "started") {
      this.scene.resume("Game");
    } else if (this.state === "init") {
      console.log("startGame");
      this.scene.start("Game");
      this.state = "started";
    }
  };
}
