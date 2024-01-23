// @ts-nocheck
import Phaser from 'phaser';
import { game } from '../scenes/Game';

declare global {
    interface ISpineContainer extends Phaser.GameObjects.Container {
        readonly spine: SpineGameObject
        faceDirection(dir: 1 | -1): void;
        setPhysicsSize(width: number, height: number): void;
    }
}

export default class SpineContainer extends Phaser.GameObjects.Container implements ISpineContainer {
    private sgo!: SpineGameObject;
    private physicsObject!: Phaser.GameObjects.Arc;
    private rightArmHitBox!: Phaser.GameObjects.Arc;

    get physicsBody() {
        return this.physicsObject.body as Phaser.Physics.Arcade.Body;
    }

    get rightHitBox() {
        return this.rightArmHitBox.body as Phaser.Physics.Arcade.Body;
    }

    get spine() {
        return this.sgo;
    }

    constructor(scene: Phaser.Scene, x: number, y: number, key: string, anim: string, loop = false) {
        super(scene, x, y)

        this.sgo = scene.add.spine(0, 0, key, anim, loop).refresh();
        this.sgo.setMix('idle', 'walk', 0.1);
        this.sgo.setMix('idle', 'jump', 0.1);
        this.sgo.setMix('idle', 'attack', 0.1);


        this.sgo.setMix('walk', 'fly', 0.1);
        this.sgo.setMix('walk', 'idle', 0.1);
        this.sgo.setMix('walk', 'jump', 0.1);
        this.sgo.setMix('walk', 'attack', 0.1);


        this.sgo.setMix('jump', 'walk', 0.1);
        this.sgo.setMix('jump', 'idle', 0.1);
        this.sgo.setMix('jump', 'fly', 0.1);

        this.sgo.setMix('fly', 'walk', 0.1);
        this.sgo.setMix('fly', 'jump', 0.1);

        this.sgo.setMix('attack', 'idle', 0.1);
        this.sgo.setMix('attack', 'walk', 0.1);

        console.log(123);

        // this.sgo.drawDebug = true;
        const leftArm = this.sgo.skeleton.findBone('bone11');
        const rightArm = this.sgo.skeleton.findBone('bone8');

        // this.sgo.setInteractive();
        this.rightArmHitBox = scene.add.circle(rightArm.worldX, this.scene.game.canvas.height - rightArm.worldY, 40, undefined, 0);
        this.physicsObject = scene.add.circle(leftArm.worldX, this.scene.game.canvas.height - leftArm.worldY, 40, undefined, 0);

        this.rightArmHitBox.setData('bone', rightArm).setInteractive();
        this.scene.input.setDraggable(this.rightArmHitBox);

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
        this.spine.setData('attack', false);


        this.scene.input.keyboard?.on('keydown-SPACE', () => {
            this.spine.setData('attack', true);
            this.spine.play('attack', false, true);
            setTimeout(() => {
                this.spine.play('idle', true, true);
                this.spine.setData('attack', false);

            }, 500);
        });

        // console.log(this.rightArmHitBox.getData('bone'));
        this.sgo.skeleton.updateWorldTransform();

    }
    faceDirection(dir: 1 | -1) {
        if (this.sgo.scaleX === dir) {
            return;
        }

        this.sgo.scaleX = dir;
    }

    setPhysicsSize(width: number, height: number) {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setOffset(width * -0.5, -height);
        body.setSize(width, height);
    }

    update(camera: Phaser.Cameras.Scene2D.Camera, cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
        const { left, right, up, space } = cursors;
        const leftArm = this.sgo.skeleton.findBone('bone11');
        const rightArm = this.sgo.skeleton.findBone('bone8');
        const isAttack = this.spine.getData('attack');

        const leftHitboxCoords = {
            x: leftArm.worldX + camera.midPoint.x - this.scene.game.canvas.width / 2,
            y: leftArm.worldY * -1 + this.scene.game.canvas.height + camera.midPoint.y - this.scene.game.canvas.height / 2 - 10
        };
        const rightHitboxCoords = {
            x: rightArm.worldX + camera.midPoint.x - this.scene.game.canvas.width / 2 - 10,
            y: rightArm.worldY * -1 + this.scene.game.canvas.height + camera.midPoint.y - this.scene.game.canvas.height / 2 + 16
        };
        this.physicsBody.position.copy(leftHitboxCoords);
        this.physicsBody.rotation = leftArm.data.rotation;

        this.rightHitBox.position.copy(rightHitboxCoords);
        this.rightHitBox.rotation = rightArm.data.rotation;
        // console.log(rightArm.worldY);


        if (left.isDown) {
            this.faceDirection(-1);
            this.body.setVelocityX(-400);
            this.sgo.play('walk', true, true)
        } else if (right.isDown) {
            console.log(this.x, this.y)
            this.faceDirection(1);
            this.body.setVelocityX(400);
            this.faceDirection(1);
            this.sgo.play('walk', true, true)
        } else if (!isAttack && this.body.blocked.down) {
            this.sgo.play('idle', true, true)
        }
        if ((up.isDown) && this.body.blocked.down) {
            this.spine.play('jump', false, true)
            this.body.setVelocityY(-600);
        }

    }
}


Phaser.GameObjects.GameObjectFactory.register('spineContainer', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, key: string, anim: string, loop = false) {
    const container = new SpineContainer(this.scene, x, y, key, anim, loop);
    this.displayList.add(container);

    return container;
})