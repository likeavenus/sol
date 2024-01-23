import Phaser from "phaser";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

export default class Lizard extends Phaser.Physics.Matter.Sprite {
  private direction = Direction.RIGHT;
  public hp = 100;
  healthBar!: Phaser.GameObjects.Graphics;
  // damageFx = this.postFX.addBloom(0xffffff, 1, 1, 0, 2);
  // damageFxTween = this.scene.tweens.add({
  //   targets: this.damageFx,
  //   blurStrength: 1.4,
  //   yoyo: true,
  //   duration: 100,
  //   paused: true,
  //   onComplete: () => {
  //     this.damageFxTween.restart();
  //     this.damageFxTween.pause();
  //   },
  // });
  emitter!: Phaser.Events.EventEmitter;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this.setScale(3);
    this.healthBar = this.scene.add.graphics();

    this.anims.play("lizard-idle");
    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.handleTileCollision,
      this
    );
  }

  public initEmitter(emitter: Phaser.Events.EventEmitter) {
    this.emitter = emitter;
  }

  // onDead() {
  //   const randomX = Math.random() * 20;
  //   this.scene.physics.add.group({
  //     key: "star",
  //     repeat: 10,
  //     setXY: {
  //       x: this.x + randomX,
  //       y: this.y - 100,
  //       stepX: Math.random() * 20,
  //     },
  //     setScale: { x: 0.8, y: 0.8 },
  //     dragX: 400,
  //     dragY: 100,
  //     createCallback: (go) => {},
  //   });
  // }

  drawHealthBar() {
    const width = 30;
    const height = 4;
    const x = -width / 2;
    const healthPercentage = this.hp / 100;

    this.healthBar.clear();

    this.healthBar.fillStyle(0xff0000);
    // const redWidth = width * healthPercentage;
    this.healthBar.fillRect(this.x - 17, this.y - 26, width, height);

    this.healthBar.fillStyle(0x00ff00);
    const greenWidth = width * healthPercentage;
    this.healthBar.fillRect(this.x - 17, this.y - 26, greenWidth, height);
  }

  public takeDamage(damage: number): void {
    this.hp -= damage;
    this.anims.play("lizard-hit");

    // if (!this.damageFxTween.isPlaying()) {
    //   this.damageFxTween.restart();
    //   this.damageFxTween.play();
    // }

    if (this.hp <= 0) {
      this.emitter.emit("lizard-dead", { x: this.x, y: this.y });
    }
  }

  private handleTileCollision(
    go: Phaser.GameObjects.GameObject,
    tile: Phaser.Tilemaps.Tile
  ) {
    if (go !== this) {
      return;
    }
    if (go?.body?.blocked?.right || go?.body?.blocked?.left) {
      const newDirection = Phaser.Math.Between(2, 3);
      this.direction = newDirection;
    }
  }

  protected preUpdate(t: number, dt: number): void {
    super.preUpdate(t, dt);
    const speed = 85;
    if (this.body?.blocked.down) {
      switch (this.direction) {
        //   case Direction.UP:
        //     this.setVelocity(0, -speed);
        //     break;
        //   case Direction.DOWN:
        //     this.setVelocity(0, speed);
        //     break;
        case Direction.LEFT:
          this.setVelocityX(-speed);
          this.scaleX = -3;
          this.setOffset(16, 0);
          this.anims.play("lizard-run", true);
          break;
        case Direction.RIGHT:
          this.setVelocityX(speed);
          this.scaleX = 3;
          this.setOffset(0);

          this.anims.play("lizard-run", true);
          break;
      }
    }

    if (this.y > 3500) {
      this.x = Math.random() * 2500;
      this.y = Math.random() * 1000;
    }

    if (this.hp > 0) {
      this.drawHealthBar();
    } else {
      this.healthBar.clear();
      this.destroy(true);
    }
  }
  create() {}
}
