import Phaser from "phaser";
import Preloader from "./Preload";
import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import { getDialog } from "./constants";
import { createLizardAnims } from "../characters/lizard/lizardAnims";
import Rope from "../containers/rope";
import Paused from "./Paused";
// import Lizard from "../characters/lizard/lizard";
import Menu from "./Menu";

const MIN = Phaser.Math.DegToRad(-180);
const MAX = Phaser.Math.DegToRad(180);
const X = 1000;
const Y = 100;
const LEVER = 64;
const WIDTH = 112;
const HEIGHT = 32;
const STIFFNESS = 0.1;
const NO_COLLISION_GROUP = 0;

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
  worm!: Phaser.Physics.Matter.Image;
  isTouchingGround = false;
  private animationNames: string[] = [];
  level: number = 1;
  loadNextLevel: boolean = false;
  showDialog: boolean = false;
  dialog: any;
  dialogLevel: number = 0;
  emitter = new Phaser.Events.EventEmitter();
  water!: Phaser.Physics.Matter.Image;
  stick!: Phaser.Physics.Matter.Sprite;
  music!:
    | Phaser.Sound.NoAudioSound
    | Phaser.Sound.HTML5AudioSound
    | Phaser.Sound.WebAudioSound;

  private backgrounds: {
    ratioX: number;
    sprite: Phaser.GameObjects.TileSprite;
  }[] = [];
  private velocityX = 10;
  collisionCategory1 = 0b0001;
  collisionCategory2 = 0b0010;
  collisionCategory3 = 0b0100;

  constructor() {
    super("Game");
  }
  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    // this.load.scenePlugin('rexuiplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', 'rexUI', 'rexUI');
  }

  create() {
    console.log(this.scene);

    /** music */
    this.sound.pauseOnBlur = false;
    this.music = this.sound.add("music", {
      volume: 0.2,
      loop: true,
    });
    if (!this.sound.locked) {
      // already unlocked so play
      this.music.play();
    } else {
      // wait for 'unlocked' to fire and then play
      this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
        this.music.play();
      });
    }
    this.game.events.on(Phaser.Core.Events.BLUR, () => {
      console.log("blur event");

      // this.handleLoseFocus();
    });

    document.addEventListener("visibilitychange", () => {
      console.log("visibilitychange");

      if (!document.hidden) {
        return;
      }

      this.handleLoseFocus();
    });
    /** music end */

    /** worm */
    this.worm = this.matter.add.image(550, 1500, "worm", undefined, {
      label: "worm",
    });
    this.worm.isAlive = true;
    this.worm.setDepth(2);
    this.worm.flipX = true;
    this.worm.setScale(0.01).setDepth(6);

    this.tweener = {
      x: MIN,
    };
    createLizardAnims(this.anims);
    this.GROUND_COLLISION_GROUP = this.matter.world.nextCategory();

    this.lizard = this.matter.add
      .sprite(550, 2000, "lizard", undefined, {
        label: "lizard",
      })
      .setScale(3)
      .setFixedRotation()
      .setDepth(5);
    this.lizard.setCollisionCategory(this.collisionCategory1);
    this.lizard.setCollidesWith(
      this.collisionCategory1 | this.collisionCategory2
    );

    this.lizard.setMass(140);

    this.rod = [];
    this.stick = this.add.rectangle(
      this.lizard.x + 70,
      this.lizard.y + 150,
      90,
      8,
      0x00aa1100
    );

    this.stick.setDepth(5);

    this.water = this.matter.add.image(
      this.lizard.x + 400,
      this.lizard.y + 380,
      "water",
      undefined,
      {
        // isStatic: false,
        // isSensor: true,
        // isSensor: true,
        // isStatic: true,
        label: "water",
      }
    );

    this.water.setDepth(5);
    this.water.alpha = 0.8;

    // this.water.setCollisionCategory(this.collisionCategory3);
    // this.water.setCollidesWith(this.collisionCategory2);
    console.log("this.water : ", this.water);
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

    const stickBody = this.matter.add.gameObject(this.stick, {
      friction: 1,
      isStatic: true,
      // collisionFilter
      // isSensor: true,
    });

    stickBody.setCollisionCategory(NO_COLLISION_GROUP);
    stickBody.setCollidesWith(NO_COLLISION_GROUP);
    // stickBody.setCollisionGroup(1);
    // stickBody.setCollidesWith(0);

    this.stick.visible = false;

    this.input.on("pointerdown", (pointer) => {
      this.matter.applyForce(this.rod.at(-1).body, {
        x: 0.55,
        y: -1,
      });
      this.rod.at(-1).setAngularVelocity(Math.PI);
    });

    const eKey = this.input.keyboard?.addKey("E");
    eKey?.on("down", (e) => {
      this.tweens.add({
        targets: this.rod.at(-2),
        x: this.lizard.x + 30,
        y: this.lizard.y,
        ease: "Bounce",
        duration: 2200,
        onStart: () => {
          this.lizard.setCollidesWith(
            this.collisionCategory3 |
              this.collisionCategory2 |
              this.collisionCategory1
          );
          this.rod.at(-2).setCollisionCategory(this.collisionCategory3);
          this.rod.at(-2).setCollidesWith(this.collisionCategory1);
        },
        onComplete: () => {
          this.lizard.setCollidesWith(
            this.collisionCategory2 | this.collisionCategory1
          );

          this.rod.at(-2).setCollisionCategory(this.collisionCategory3);
          this.rod
            .at(-2)
            .setCollidesWith(this.collisionCategory1 | this.collisionCategory2);
        },
      });
    });

    const space = this.input.keyboard.addKey("space");

    // space.on("down", () => this.flip(true), this);
    // space.on("up", () => this.flip(false), this);
    this.createRod();
    space.on("down", () => {
      this.stick.visible = !this.stick.visible;
      this.rod.forEach((item) => {
        item.visible = !item.visible;
      });

      if (this.stick.visible && this.starsSummary > 0) {
        // this.worm.setCollidesWith(null);
      }
    });

    this.rod.forEach((item) => {
      item.visible = !item.visible;
    });

    this.matter.add.mouseSpring();

    this.cameras.main.startFollow(this.lizard);

    this.lizard.setOnCollide((data: MatterJS.ICollisionPair) => {
      this.isTouchingGround = true;

      const { bodyA, bodyB } = data;

      if (bodyA.label === "worm" || bodyB.label === "worm") {
        this.collectWorm();
        this.worm.visible = false;
      }
    });

    // this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
    //   // Обработка начала столкновения между bodyA и bodyB
    //   console.log("bodyA", bodyA.label);
    //   console.log("____________________");

    //   console.log("bodyB", bodyB.label);

    //   // if (bodyA.label === "Circle Body" && bodyB.label === this.rod.at(-1)) {
    //   //   console.log("Поймал крючок!");
    //   // }
    // });
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
    this.bg1 = this.add.image(this.lizard.x, this.lizard.y, "bg1").setDepth(0);
    this.backgrounds.push(this.bg1);
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

    groundLayer2?.setName("ground");
    groundLayer3?.setName("ground");

    groundLayer2.setPipeline("Light2D");
    groundLayer3.setPipeline("Light2D");

    const debugLayer = this.add.graphics();
    // groundLayer2?.setCollisionCategory(GROUND_COLLISION_GROUP);
    // groundLayer3?.setCollisionCategory(GROUND_COLLISION_GROUP);

    groundLayer2?.setCollisionByProperty({ collides: true });
    groundLayer3?.setCollisionByProperty({ collides: true });
    groundLayer2?.setCollisionCategory(this.collisionCategory2);
    groundLayer2?.setCollidesWith(
      this.collisionCategory1 | this.collisionCategory3
    );

    groundLayer3?.setCollisionCategory(this.collisionCategory2);
    groundLayer3?.setCollidesWith(
      this.collisionCategory1 | this.collisionCategory3
    );

    this.matter.world.convertTilemapLayer(groundLayer2);
    this.matter.world.convertTilemapLayer(groundLayer3);

    // console.log("groundLayer3: ", groundLayer3);
    console.log(groundLayer2);

    this.matter.world.on("collisionend", (e, bodyA, bodyB) => {
      if (
        e.pairs.some(
          (pair) => pair.bodyA.label == "water" && pair.bodyB.label == "hook"
        )
      ) {
        this.rod.at(-2).inWater = false;
      }
    });

    this.matter.world.on("collisionactive", (e, o1, o2) => {
      if (
        e.pairs.some(
          (pair) => pair.bodyA.label == "water" && pair.bodyB.label == "hook"
        )
      ) {
        this.rod.at(-2).inWater = true;
      }

      if (
        e.pairs.some(
          (pair) => pair.bodyA.label == "lizard" && pair.bodyB.label == "hook"
        )
      ) {
        console.log("Поймал крючок");
      }

      // if( e.pairs.some (pair => pair.bodyA.label == 'enemy' && pair.bodyB.label =='floor' )) {
      //     text += '\ne: touch floor';
      // }
    });

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
      .text(60, 30, `Worms: ${this.starsSummary}`, {
        fontSize: "24px",
        fontFamily: "Arial",
        color: "#ffffff",
      })
      .setScrollFactor(0);

    this.emitter.on("lizard-dead", ({ x, y }: { x: number; y: number }) => {
      for (let i = 0; i < 20; i++) {
        this.stars.create(x, y, "star");
      }

      this.starsText.setText(`Worms: ${this.starsSummary}`);
    });

    this.lights.enable();
    // setTimeout(() => {
    //   this.lights.setAmbientColor(0xf00ff);
    // }, 1000);
    this.lights.setAmbientColor(0x808080);

    this.events.on("resume", () => {
      console.log("resume");
    });
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

  update(time: number, delta: number) {
    this.starsText.setText(`Worms: ${this.starsSummary}`);
    if (!this.lizard.flipX) {
      this.stick.copyPosition({ x: this.lizard.x + 70, y: this.lizard.y });
    } else {
      this.stick.copyPosition({ x: this.lizard.x - 70, y: this.lizard.y });
    }

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
      this.lizard.setVelocityY(-10);
      this.isTouchingGround = false;
    }

    if (this.starsSummary > 0 && this.worm.isAlive) {
      this.worm.visible = true;
      this.worm.isAlive = false;
      this.worm.setCollidesWith(null);
    }

    if (this.starsSummary > 0 && !this.worm.isAlive) {
      this.worm.visible = this.stick.visible;
      if (this.worm.visible) {
        this.worm.copyPosition({
          x: this.rod.at(-1).x,
          y: this.rod.at(-1).y,
        });
      }
    }

    if (this.rod.at(-2).inWater) {
      const prevLastRod = this.rod.at(-2) as Phaser.Physics.Matter.Image;
      const lastRod = this.rod.at(-1) as Phaser.Physics.Matter.Image;

      const randomEventId = Math.floor(Math.random() * 200);

      if (randomEventId === 5 && this.starsSummary > 0) {
        // console.log("randomEventId: ", randomEventId);
        lastRod.setPosition(
          lastRod.x + (Math.random() - 2.5) * 5,
          lastRod.y + 5
        );
      }
    }
  }

  createRod() {
    let prev = this.stick;
    const count = 32;

    for (var i = 0; i < count; i++) {
      const isLastItem = i === count - 1;
      const isPrevLastItem = i === count - 2;
      const newItem = this.matter.add
        .image(
          this.lizard.x + i * 2,
          this.lizard.y + i * 2,
          isLastItem ? "hook" : "rope",
          null,
          {
            shape: "circle",
            mass: isPrevLastItem ? 15 : 5,
            frictionAir: isLastItem ? 0.05 : 0.01,
            label: isPrevLastItem ? "hook" : "chain",
          }
        )
        .setScale(isLastItem ? 1.5 : 0.25)
        .setDepth(5);
      if (isPrevLastItem) {
        // newItem.visible = false;
        newItem.alpha = 0;
        newItem.setScale(1.1);
        // newItem.setSensor(true);
      }
      // if (!isLastItem) {

      // }

      if (!isPrevLastItem) {
        newItem.setCollisionCategory(NO_COLLISION_GROUP);
        newItem.setCollidesWith(NO_COLLISION_GROUP);
      }

      if (isPrevLastItem) {
        newItem.setCollisionCategory(this.collisionCategory3);
        newItem.setCollidesWith(
          this.collisionCategory1 | this.collisionCategory2
        );
      }

      this.rod.push(newItem);

      if (i === 0) {
        this.matter.add.joint(prev, this.rod[i], 10, 1, {
          pointA: { x: 50, y: 0 },
          pointB: { x: 0, y: 0 },
          stiffness: 1,
        });
      } else if (isPrevLastItem) {
        this.matter.add.joint(prev, this.rod[i], 5, 1, {
          pointA: { x: 0, y: 0 },
          // pointB: { x: -7, y: -20 },
          pointB: { x: -7, y: 0 },
          stiffness: 1,
        });
      } else if (isLastItem) {
        this.matter.add.joint(prev, this.rod[i], 5, 1, {
          pointA: { x: 0, y: 0 },
          // pointB: { x: -7, y: -20 },
          pointB: { x: -7, y: -20 },
          stiffness: 1,
        });
      } else {
        this.matter.add.joint(prev, this.rod[i], 8, 1, {
          stiffness: 1,
        });
      }
      prev = this.rod[i];
    }

    let offset = {
      x: 0,
      // y: -this.rod.at(-2).height / 2,
      y: 20,
    };

    let body = this.rod.at(-2).body;
    const lastRod = this.rod.at(-2) as Phaser.Physics.Matter.Image;
    body.position.x += offset.x;
    body.position.y += offset.y;
    body.positionPrev.x += offset.x;
    body.positionPrev.y += offset.y;
    // this.rod.at(-1).setFixedRotation();
    lastRod.name = "hook";
    lastRod.label = "hook";
    lastRod.inWater = false;
    lastRod.setOnCollide((data: MatterJS.ICollisionPair) => {
      const { bodyA, bodyB } = data;
      // console.log(bodyA.label, bodyB.label);
      // console.log("bodyA.label: ", bodyA.label);

      if (bodyA.label === "water" || bodyB.label === "water") {
        lastRod.inWater = true;
        // console.log(lastRod.inWater);
      }
    });

    // lastRod.setOnCollideEnd((data: MatterJS.ICollisionPair) => {
    //   const { bodyA, bodyB } = data;

    //   if (bodyA.label === "hook" || bodyB.label === "hook") {
    //     lastRod.inWater = false;
    //     console.log("inWater", lastRod.inWater);
    //   }
    // });
  }

  handleLoseFocus() {
    // assuming a Paused scene that has a pause modal
    if (this.scene.isActive("paused")) {
      return;
    }

    // pause music or stop all sounds
    this.music.pause();
    this.scene.pause();

    // Paused Scene will call the onResume callback when ready
    this.scene.run("Menu", {
      onResume: () => {
        // resume music
        this.music.resume();
        console.log("resume music");
        this.scene.pause("paused");
        this.scene.resume("Game");
      },
    });
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
      onComplete: () => {},
    });
  }
  collectWorm() {
    this.starsSummary += 1;
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
  scene: [Preloader, Menu, Paused, Game],
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
