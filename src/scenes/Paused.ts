import Phaser from "phaser";

export default class Paused extends Phaser.Scene {
  window!: Phaser.GameObjects.Graphics;
  constructor() {
    super("paused");
  }

  create() {
    console.log("paused");
    this.window = this.add.rectangle(
      this.cameras.main.x,
      this.cameras.main.y,
      500,
      400,
      0xffffff,
      0.9
    );

    this.input.on("pointerdown", this.startGame);
  }

  startGame = () => {
    this.scene.start("preloader");
  };
}
