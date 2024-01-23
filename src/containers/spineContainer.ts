// @ts-nocheck
import Phaser from "phaser";
// import { game } from "../scenes/Game";

declare global {
  interface ISpineContainer extends Phaser.GameObjects.Container {
    readonly spine: SpineGameObject;
    direction: number;
    faceDirection(dir: 1 | -1): void;
    setPhysicsSize(width: number, height: number): void;
  }
}

export default class SpineContainer
  extends Phaser.GameObjects.Container
  implements ISpineContainer
{
  private sgo!: SpineGameObject;
  private physicsObject!: Phaser.GameObjects.Arc;
  private rightArmHitBox!: Phaser.GameObjects.Arc;
  private leftArmHitBox!: Phaser.GameObjects.Arc;
  private canDoublejump!: boolean = false;
  healthBar!: Phaser.GameObjects.Graphics;
  public hp = 100;
  direction: number = 1;

  get physicsBody() {
    return this.physicsObject.body as Phaser.Physics.Arcade.Body;
  }

  get rightHitBox() {
    return this.rightArmHitBox.body as Phaser.Physics.Arcade.Body;
  }

  get spine() {
    return this.sgo;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    key: string,
    anim: string,
    loop = false
  ) {
    super(scene, x, y);

    this.sgo = scene.add.spine(0, 0, key, anim, loop).refresh();
    this.sgo.setMix("idle", "walk", 0.1);
    this.sgo.setMix("idle", "jump", 0.1);
    this.sgo.setMix("idle", "attack", 0.1);

    this.sgo.setMix("walk", "fly", 0.1);
    this.sgo.setMix("walk", "idle", 0.1);
    this.sgo.setMix("walk", "jump", 0.1);
    this.sgo.setMix("walk", "attack", 0.1);

    this.sgo.setMix("jump", "walk", 0.1);
    this.sgo.setMix("jump", "idle", 0.1);
    this.sgo.setMix("jump", "fly", 0.1);

    this.sgo.setMix("fly", "walk", 0.1);
    this.sgo.setMix("fly", "jump", 0.1);

    this.sgo.setMix("attack", "idle", 0.1);
    this.sgo.setMix("attack", "walk", 0.1);

    // this.sgo.state.timeScale = 1.7;
    this.sgo.state.timeScale = 1.7;

    7;
    // this.sgo.drawDebug = true;
    const leftArm = this.sgo.skeleton.findBone("bone11");
    const rightArm = this.sgo.skeleton.findBone("bone8");
    // this.sgo.angleBoneToXY(rightArm, rightArm.worldX, rightArm.worldY)

    // this.sgo.setInteractive();
    this.rightArmHitBox = scene.add.circle(
      rightArm.worldX,
      this.scene.game.canvas.height - rightArm.worldY,
      40,
      undefined,
      0
    );
    this.leftArmHitBox = scene.add.circle(
      rightArm.worldX,
      this.scene.game.canvas.height - rightArm.worldY,
      40,
      undefined,
      0
    );
    this.physicsObject = scene.add.circle(
      leftArm.worldX,
      this.scene.game.canvas.height - leftArm.worldY,
      40,
      undefined,
      0
    );

    this.rightArmHitBox.setData("bone", rightArm).setInteractive();
    // this.scene.input.setDraggable(this.rightArmHitBox);

    this.add(this.physicsObject);
    this.add(this.rightArmHitBox);

    scene.physics.add.existing(this.physicsObject);
    scene.physics.add.existing(this.rightArmHitBox);

    this.physicsBody.setAllowGravity(false);
    this.physicsBody.setCircle(60);

    this.rightHitBox.setAllowGravity(false);
    this.rightHitBox.setCircle(60);

    scene.physics.add.existing(this);

    const bounds = this.sgo.getBounds();
    const width = bounds.size.x;
    const height = bounds.size.y;
    this.setPhysicsSize(width, height);
    this.add(this.sgo);

    // this.body.checkCollision.up = false;
    // this.body.checkCollision.left = false;
    // this.body.checkCollision.right = false;

    // scene.input.keyboard?.on('keydown-SPACE', () => {
    //     this.sgo.play('attack', true, true)
    // });

    // leftArm.children.push(this.physicsBody)
    this.spine.setData("attack", false);

    this.scene.input.keyboard?.on("keydown-SPACE", () => {
      if (this.body.blocked.down) {
        this.spine.setData("attack", true);
        setTimeout(() => {
          this.spine.setData("attack", false);
        }, 300);
        this.spine.play("attack", false, true);
        // this.scene.cameras.main.zoomTo(0.5);
        setTimeout(() => {
          this.spine.play("idle", true, true);
        }, /**500*/ 500);
      }
    });

    this.scene.input.keyboard?.on("keydown-Q", () => {
      if (this.direction > 0) {
        // this.body.setVelocityX(2000);
        // this.setPosition(this.x + 300, this.y);
        this.body.setVelocityX(4000);
      } else {
        this.body.setVelocityX(-4000);
        // this.setPosition(this.x - 300, this.y);
      }

      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 80,
        yoyo: true,
      });

      setTimeout(() => {
        this.body.setVelocityX(0);
      }, 80);
    });
    this.scene.input.keyboard?.on("keydown-UP", () => {
      if (this.body.blocked.down) {
        this.spine.play("jump", false, true);
        this.body.setVelocityY(-1000);
        this.canDoublejump = true;
      } else {
        if (this.canDoublejump) {
          this.spine.play("jump", false, true);
          this.body.setVelocityY(-1000);
          this.canDoublejump = false;
        }
      }
    });

    // console.log(this.rightArmHitBox.getData('bone'));
    this.sgo.skeleton.updateWorldTransform();

    this.healthBar = this.scene.add.graphics();
    this.healthBar.setScrollFactor(0);
    this.healthBar.setDepth(1);
  }

  drawHealthBar() {
    const width = 350;
    const height = 15;
    const x = -width / 2;
    const healthPercentage = this.hp / 100;

    this.healthBar.clear();

    this.healthBar.fillStyle(0xff0000);
    // const redWidth = width * healthPercentage;
    this.healthBar.fillRect(50, 61, width, height);

    this.healthBar.fillStyle(0x00ff00);
    const greenWidth = width * healthPercentage;
    this.healthBar.fillRect(50, 61, greenWidth, height);
  }

  faceDirection(dir: 1 | -1) {
    if (this.sgo.scaleX === dir) {
      return;
    }
    this.direction = dir;
    this.sgo.scaleX = dir;
  }

  setPhysicsSize(width: number, height: number) {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setOffset(width * -0.5, -height);
    body.setSize(width, height);
  }

  update(
    camera: Phaser.Cameras.Scene2D.Camera,
    cursors: Phaser.Types.Input.Keyboard.CursorKeys
  ) {
    const { left, right, up, space, q } = cursors;
    const leftArm = this.sgo.skeleton.findBone("bone11");
    const rightArm = this.sgo.skeleton.findBone("bone8");
    const isAttack = this.spine.getData("attack");

    const leftHitboxCoords = {
      x: leftArm.worldX + camera.midPoint.x - this.scene.game.canvas.width / 2,
      y:
        leftArm.worldY * -1 +
        this.scene.game.canvas.height +
        camera.midPoint.y -
        this.scene.game.canvas.height / 2 -
        10,
    };
    const rightHitboxCoords = {
      x:
        rightArm.worldX +
        camera.midPoint.x -
        this.scene.game.canvas.width / 2 -
        10,
      y:
        rightArm.worldY * -1 +
        this.scene.game.canvas.height +
        camera.midPoint.y -
        this.scene.game.canvas.height / 2,
    };

    if (this.direction > 0) {
      rightHitboxCoords.x += 60;
    } else {
      rightHitboxCoords.x -= 90;
    }

    this.physicsBody.position.copy(leftHitboxCoords);
    this.rightHitBox.position.copy(rightHitboxCoords);

    if (this?.body?.y > 3500) {
      // this.body.y = -1000;
    }

    if (
      left.isDown &&
      !this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q).isDown
    ) {
      this.faceDirection(-1);
      this.body.setVelocityX(-550);
      if (this.body.blocked.down) {
        this.sgo.play("walk", true, true);
      }
    } else if (
      right.isDown &&
      !this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q).isDown
    ) {
      this.faceDirection(1);
      this.body.setVelocityX(550);
      this.faceDirection(1);
      if (this.body.blocked.down) {
        this.sgo.play("walk", true, true);
      }
    } else if (!isAttack && this.body.blocked.down) {
      this.sgo.play("idle", true, true);
    }
    // controls up
    if (up.isDown && this.body.blocked.down) {
      // this.spine.play("jump", false, true);
      // this.body.setVelocityY(-600);
    }
    if (this.body.blocked.down) {
    }
    // TODO: сделать отдельную анимацию падения
    if (!this.body.blocked.down) {
      // this.spine.play("jump", false, true);
    }

    if (this.hp > 0) {
      this.drawHealthBar();
    } else {
      this.healthBar.clear();
      // this.destroy(true);
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  "spineContainer",
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    key: string,
    anim: string,
    loop = false
  ) {
    const container = new SpineContainer(this.scene, x, y, key, anim, loop);
    this.displayList.add(container);

    return container;
  }
);
