import Phaser from 'phaser';

export default class SwordContainer extends Phaser.GameObjects.Container {
    private display: Phaser.GameObjects.Image;
    private physicsObject!: Phaser.GameObjects.Arc;

    get physicsBody() {
        return this.physicsObject.body as Phaser.Physics.Arcade.Body;
    }

    get physicsDisplay() {
        return this.physicsObject;
    }
    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y);
        this.setDepth(10);

        this.display = scene.add.image(0, 7, 'sword');
        this.display.setScale(0.01, 0.01);
        this.display.setAngle(-15);
        // this.display.setVisible(false);
        this.display.setOrigin(0, 1);
        this.add(this.display);

        const width = this.display.width;
        const radius = 10;

        this.physicsObject = scene.add.circle(16, -20, radius, undefined, 0);
        this.add(this.physicsObject);
        scene.physics.add.existing(this.physicsObject);

        this.physicsBody.setAllowGravity(false);

        this.physicsBody.setCircle(10);

        scene.add.existing(this);
    }
}