import Phaser from "phaser";
import Preloader from "./Preload";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { getDialog } from "./constants";
import { createLizardAnims } from "../characters/lizard/lizardAnims";
import Rope from "../containers/rope";
// import Lizard from "../characters/lizard/lizard";

const MIN = Phaser.Math.DegToRad(-180);
const MAX = Phaser.Math.DegToRad(180);
const X = 1000;
const Y = 100;
const LEVER = 64;
const WIDTH = 112;
const HEIGHT = 32;
const STIFFNESS = 0.1;

class Game extends Phaser.Scene {
  hook!: Phaser.Physics.Matter.Image;
  lineGroup!: Phaser.Physics.Matter.Image[];
  bait!: Phaser.Physics.Matter.Image;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  player!: Phaser.Physics.Arcade.Sprite;
  platforms!: Phaser.Physics.Arcade.StaticGroup;
  movingPlatform!: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
  stars!: Phaser.Physics.Arcade.Group;
  starsSummary = 0;
  lizard!: Phaser.Physics.Matter.Sprite;
  isTouchingGround = false;
  private animationNames: string[] = [];
  level: number = 1;
  loadNextLevel: boolean = false;
  showDialog: boolean = false;
  dialog: any;
  dialogLevel: number = 0;
  emitter = new Phaser.Events.EventEmitter();
  stick!: Phaser.Physics.Matter.Sprite;
  private backgrounds: {
    ratioX: number;
    sprite: Phaser.GameObjects.TileSprite;
  }[] = [];
  private velocityX = 10;

  constructor() {
    super("Game");
  }
  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    // this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI');
  }

  create() {
    this.tweener = {
      x: MIN,
    };
    createLizardAnims(this.anims);

    this.lizard = this.matter.add
      .sprite(550, 2000, "lizard", undefined)
      .setScale(3)
      .setFixedRotation();
    this.lizard.setFixedRotation();
    this.lizard.setAngularVelocity(0);
    this.lizard.setCollisionCategory(2);
    this.lizard.setMass(140);

    this.rod = [];
    this.stick = this.add.rectangle(
      this.lizard.x + 70,
      this.lizard.y + 60,
      90,
      8,
      0x00aa1100
    );

    this.lever = this.matter.add
      .image(
        X - Math.cos(this.tweener.x) * LEVER,
        Y - Math.sin(this.tweener.x) * LEVER,
        null,
        null,
        {
          isSensor: true,
          isStatic: true,
        }
      )
      .setVisible(false);

    console.log(this.lever);

    const stickBody = this.matter.add.gameObject(this.stick, {
      friction: 1,
      isStatic: true,
      // collisionFilter
      // isSensor: true,
    });

    stickBody.setCollisionGroup(1);
    stickBody.setCollidesWith(0);

    this.stick.visible = false;

    // this.matter.add.worldConstraint(stickBody, 0, 1, {
    //   pointA: new Phaser.Math.Vector2(X, Y),
    //   pointB: new Phaser.Math.Vector2((WIDTH - HEIGHT) / 2, 0),
    // });

    // this.matter.add.constraint(stickBody, this.lever.body, 0, STIFFNESS, {
    //   pointA: new Phaser.Math.Vector2((WIDTH - HEIGHT) / 2 + LEVER, 0),
    //   pointB: new Phaser.Math.Vector2(),
    // });

    this.input.on("pointerdown", (pointer) => {});

    const space = this.input.keyboard.addKey("space");

    // space.on("down", () => this.flip(true), this);
    // space.on("up", () => this.flip(false), this);
    space.on("down", () => {
      this.stick.visible = !this.stick.visible;
      if (!this.rod.length) {
        this.createRod();
      } else {
        this.rod.forEach((item) => {
          item.visible = !item.visible;
        });
      }
    });

    this.matter.add.mouseSpring();

    this.cameras.main.startFollow(this.lizard);

    this.lizard.setOnCollide((data: MatterJS.ICollisionPair) => {
      this.isTouchingGround = true;
    });
    // this.cameras.main.setZoom(0.3, 0.3);
    this.dialog = getDialog(this.scene.scene);
    this.dialog.on(
      "button.click",
      (button, groupName, index, pointer, event) => {
        console.log(button.name);
        if (button.name === "X") {
          this.dialog.hide();
          this.showDialog = false;
        }
      },
      this.scene
    );

    const dialogTween = this.tweens.add({
      targets: this.dialog,
      scaleX: 1,
      scaleY: 1,
      ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 1000,
      repeat: 0, // -1: infinity
      yoyo: false,
    });

    const { width, height } = this.scale;
    // this.level === 1
    //   ? this.add
    //       .image(0, 0, "sky")
    //       .setOrigin(0, 0)
    //       .setScrollFactor(0)
    //       .setScale(2, 2)
    //   : null;

    // this.backgrounds.push(
    //   {
    //     ratioX: 0.01,
    //     sprite: this.add
    //       .tileSprite(0, 0, width, height, "mountains")
    //       .setOrigin(0, 0)
    //       .setScrollFactor(0, 0)
    //       .setDepth(0)
    //       .setScale(2, 2),
    //   },
    //   {
    //     ratioX: 0.1,
    //     sprite: this.add
    //       .tileSprite(0, 0, width, height, "middle")
    //       .setOrigin(0, 0)
    //       .setScrollFactor(0, 0)
    //       .setDepth(0)
    //       .setScale(2, 2),
    //   }
    // );
    const isFirstLevel = this.level === 1;
    // const map = this.make.tilemap({ key: isFirstLevel ? "desert" : "dungeon" });
    // const map = this.make.tilemap({ key: "map" });
    const map2 = this.make.tilemap({ key: "floorMap" });
    const tileset2 = map2.addTilesetImage(
      "floor",
      "tiles-floor"
    ) as Phaser.Tilemaps.Tileset;
    tileset2.setTileSize(32, 32);
    const groundLayer2 = map2.createLayer("Tile Layer 2", tileset2);
    const groundLayer3 = map2.createLayer("Tile Layer 3", tileset2);
    groundLayer2.setPipeline("Light2D");
    groundLayer3.setPipeline("Light2D");

    const debugLayer = this.add.graphics();
    // groundLayer?.setCollisionByProperty({ collides: true });
    groundLayer2?.setCollisionByProperty({ collides: true });
    groundLayer3?.setCollisionByProperty({ collides: true });

    this.matter.world.convertTilemapLayer(groundLayer2);
    this.matter.world.convertTilemapLayer(groundLayer3);

    // dungeonLayer?.setCollisionByProperty({ collides: true });
    // groundLayer2?.renderDebug(debugLayer, {
    //   tileColor: null,
    //   collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
    //   faceColor: new Phaser.Display.Color(40, 39, 37, 255),
    // });

    // this.tweens.add({
    //   targets: this.boy,
    //   // scaleX: 2,
    //   // scaleY: 2,
    //   alpha: 0,
    //   ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
    //   duration: 1000,
    //   repeat: 0, // -1: infinity
    //   yoyo: false,
    // });

    this.starsText = this.add
      .text(60, 30, `Stars: ${this.starsSummary}`, {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setScrollFactor(0);

    this.emitter.on("lizard-dead", ({ x, y }: { x: number; y: number }) => {
      for (let i = 0; i < 20; i++) {
        this.stars.create(x, y, "star");
      }

      this.starsText.setText(`Stars: ${this.starsSummary}`);
    });

    this.lights.enable();
    // setTimeout(() => {
    //   this.lights.setAmbientColor(0xf00ff);
    // }, 1000);
    this.lights.setAmbientColor(0x808080);

    // this.light = this.lights
    //   .addLight(this.boy.x, this.boy.y, 280)
    //   .setIntensity(3);

    // this.cameras.main.postFX.addTiltShift(0.9, 2.0, 0.4);
    // const lizard = this.physics.add.sprite(256, 500, "lizard").setScale(3.5);
    // const lizards = this.physics.add.group({
    //   classType: Lizard,
    //   runChildUpdate: true,
    //   createCallback: (go) => {
    //     (go as Lizard).initEmitter(this.emitter);
    //     (go as Lizard).body.onCollide = true;
    //   },
    // });

    // lizards.create(600, 1500, "lizard");
    // lizards.create(700, 2000, "lizard");
    // lizards.create(300, 1000, "lizard");

    // this.physics.add.collider(lizards, groundLayer2);
    // this.physics.add.collider(lizards, groundLayer3);

    this.cameras.main.setFollowOffset(-30, 80);

    // this.rope = new Rope(this, this.lizard.x, this.lizard.y - 50, 500, 10);
  }

  update(time) {
    this.starsText.setText(`Stars: ${this.starsSummary}`);

    this.stick.copyPosition({ x: this.lizard.x + 80, y: this.lizard.y });

    const size = this.animationNames.length;
    const { left, right, up, space } = this.cursors;
    const speed = 5;
    if (this.cursors.left.isDown) {
      this.lizard.setVelocityX(-speed);
      this.lizard.flipX = true;
      this.lizard.anims.play("lizard-run", true);
    } else if (this.cursors.right.isDown) {
      this.lizard.setVelocityX(speed);
      this.lizard.flipX = false;
      this.lizard.anims.play("lizard-run", true);
    } else {
      this.lizard.setVelocityX(0);
      this.lizard.anims.play("lizard-idle", true);
    }

    if (Phaser.Input.Keyboard.JustDown(up) && this.isTouchingGround) {
      this.lizard.setVelocityY(-18);
      this.isTouchingGround = false;
    }
  }

  createRod() {
    let prev = this.stick;

    for (var i = 0; i < 22; i++) {
      this.rod.push(
        this.matter.add
          .image(
            this.lizard.x,
            this.lizard.y,
            i === 21 ? "hook" : "rope",
            null,
            {
              shape: "circle",
              mass: i === 21 ? 15 : 10,
              frictionAir: i === 21 ? 0.05 : 0.01,
            }
          )
          .setScale(i === 21 ? 1.1 : 1)
      );

      if (i === 0) {
        this.matter.add.joint(prev, this.rod[i], i === 0 ? 10 : 9, 1, {
          pointA: { x: 50, y: 0 },
          pointB: { x: 0, y: 0 },
          stiffness: 1,
        });
      } else if (i === 21) {
        this.matter.add.joint(prev, this.rod[i], i === 21 ? 5 : 9, 1, {
          pointA: { x: 0, y: 0 },
          pointB: { x: -7, y: -15 },
          stiffness: 1,
        });
      } else {
        this.matter.add.joint(prev, this.rod[i], 9, 1, {
          stiffness: 1,
        });
      }

      prev = this.rod[i];
    }

    // this.rod.at(-1).setOrigin(0.5, 0);

    let offset = {
      x: 0,
      y: -this.rod.at(-1).height / 2,
    };

    let body = this.rod.at(-1).body;
    body.position.x += offset.x;
    body.position.y += offset.y;
    body.positionPrev.x += offset.x;
    body.positionPrev.y += offset.y;
    // this.rod.at(-1).setFixedRotation();
  }

  flip(isDown: boolean) {
    this.tweens.add({
      targets: [this.tweener],
      x: isDown ? MAX : MIN,
      duration: 200,
      onUpdateScope: this,
      onUpdate: () => {
        this.lever.setPosition(
          X - Math.cos(this.tweener.x) * LEVER,
          Y - Math.sin(this.tweener.x) * LEVER
        );
      },
      onComplete: () => {
        // this.matter.applyForce(this.rod.at(-1).body, {
        //   x: 10,
        // });
      },
    });
  }
  collectStar(player, star?: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
    if (star?.alpha === 1) {
      star!.disableBody(true, false);
      this.tweens.add({
        targets: star,
        x: -5000,
        y: -2000,
        ease: "Bounce", // 'Cubic', 'Elastic', 'Bounce', 'Back'
        duration: 3000,
        repeat: 0, // -1: infinity
        yoyo: false,
      });

      setTimeout(() => {
        this.starsSummary += 5;
      }, 500);

      setTimeout(() => {
        star!.disableBody(true, true);
        this.scene.remove(star);
      }, 2000);
    }
  }
  punchStar(body, star?: Phaser.Types.Physics.Arcade.ImageWithDynamicBody) {
    // star!.disableBody(true, true);
  }

  punchLizard(
    body,
    lizards?: Phaser.Types.Physics.Arcade.ImageWithDynamicBody
  ) {}
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "matter",
    matter: {
      // debug: true,
      // gravity: {
      //   y: 1,
      // },
    },
  },
  scene: [Preloader, Game],
  plugins: {
    scene: [
      {
        key: "rexUI",
        plugin: UIPlugin,
        mapping: "rexUI",
      },
    ],
  },
};

export const game = new Phaser.Game(config);
