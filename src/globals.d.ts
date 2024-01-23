declare interface Window {
    SpinePlugin: any
}
declare namespace Phaser.GameObjects {
    interface GameObjectFactory {
        spineContainer(x: number, y: number, key: string, anim: string, loop?: boolean): ISpineContainer
    }

    interface Container {
        add(go: SpineGameObject): Phaser.GameObjects.Container
    }
}