import Phaser from "phaser";
import { createLizardAnims } from "../lizard-example/lizardAnims";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export default class Sol extends Phaser.Physics.Matter.Sprite {
  private direction = Direction.RIGHT;
  public hp = 100;
  isTouchingGround = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene.matter.world, x, y, texture, frame, {
      label: "lizard",
    });
    this.setScale(3);
    this.setFixedRotation();
    this.setDepth(7);
    this.scene.add.existing(this);
    createLizardAnims(this.scene.anims);
    this.anims.play("lizard-idle");

    this.setOnCollide((data: MatterJS.ICollisionPair) => {
      this.isTouchingGround = true;
      if (data.bodyA.label === "lizard" && data.bodyB.label === "water") {
        this.setFrictionAir(0.25);
      } else {
        this.setFrictionAir(0);
      }
    });
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys): void {
    const { left, right, up, space } = cursors;
    const speed = 5;
    if (left.isDown) {
      this.setVelocityX(-speed);
      this.flipX = true;
      this.anims.play("lizard-run", true);
    } else if (right.isDown) {
      this.setVelocityX(speed);
      this.flipX = false;
      this.anims.play("lizard-run", true);
    } else {
      this.setVelocityX(0);
      this.anims.play("lizard-idle", true);
    }

    if (Phaser.Input.Keyboard.JustDown(up) && this.isTouchingGround) {
      this.setVelocityY(-15);
      this.isTouchingGround = false;
    }
  }
}
