import Phaser from "phaser";
import { createBatAnims } from "../characters/bat/createBatAnims";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export default class Bat extends Phaser.Physics.Matter.Sprite {
  private direction = Direction.RIGHT;
  public hp = 100;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene.matter.world, x, y, texture, frame, {
      label: "bat",
    });
    this.setScale(1.5);
    this.setFixedRotation();
    this.setDepth(6);
    this.setIgnoreGravity(true);
    this.scene.add.existing(this);
    createBatAnims(this.scene.anims);
    this.anims.play("bat-move");
  }

  update(time: number): void {
    // let angle = Math.sin(time / 100) * 0.5;
    // let distance = 100;
    // this.x = this.x + angle * distance;
    // if (prevX > this.x) {
    //   this.flipX = true;
    // } else {
    //   this.flipX = false;
    // }
    // this.y = this.y + angle * 10;
    // this.angle = angle * Phaser.Math.RAD_TO_DEG;
  }
}
