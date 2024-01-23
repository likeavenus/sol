import Phaser from "phaser";

// import LizardPng from 'lizard/lizard.png';
// import LizardJson from 'lizard/lizard.json';
// import SkyPng from 'bg/Sky.png';
// import StarPng from 'star.png';
// import PlatformPng from 'platform.png';
// import PlatformPng from 'world/Tile-1.jpg';
// import MountainsPng from 'bg/Mountains.png';
// import MiddlePng from 'bg/Middle.png';
// import ForeGroundPng from 'bg/foreground.png';
// import ground1 from 'bg/Ground_01.png';
// import ground2 from 'bg/Ground_02.png';

// import Lvl1 from '../../public/assets/tilemap/desert.json';
// import Desert from 'tilemap/desert_tiles.png';
// import Dungeon from '../../public/assets/tilemap/dungeon.json';

// import shadowJson from '../../public/assets/spine/shadow.json';
// import shadowAtlas from '../../public/assets/spine/shadow.atlas';

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("preloader");
  }

  preload() {
    // this.load.image("tiles", "assets/tilemap/desert_tiles.png");
    // this.load.tilemapTiledJSON("desert", "assets/tilemap/desert.json");
    // this.load.tilemapTiledJSON("dungeon", "assets/tilemap/dungeon.json");

    // this.load.image("tiles2", "assets/tilemap/dungeon2_tileset.png");
    // this.load.tilemapTiledJSON("dungeon2", "assets/tilemap/dungeon2.json");
    // this.load.image("tiles", "assets/tilemap/dungeon_plain.png");
    // this.load.tilemapTiledJSON("bricks", "assets/tilemap/bricks.json");
    // this.load.image("tiles2", "assets/tilemap/mossy-tileset.png");
    // this.load.tilemapTiledJSON("mossy", "assets/tilemap/mossy.json");
    this.load.image("tiles2", "assets/tilemap/brick2.png");
    this.load.tilemapTiledJSON("brick2", "assets/tilemap/brick2.json");

    this.load.image("tiles", "assets/tilemap/forest-tileset.png");
    this.load.tilemapTiledJSON("map", "assets/tilemap/map.json");

    this.load.image("tiles-floor", "assets/tilemap/floor/floor.png");
    this.load.tilemapTiledJSON("floorMap", "assets/tilemap/floor/floor.json");

    this.load.atlas(
      "lizard",
      "assets/lizard/lizard.png",
      "assets/lizard/lizard.json"
    );
    this.load.image("ground", "assets/world/Tile-1.jpg");
    this.load.image("star", "assets/star.png");

    this.load.image("branch", "assets/branch/branch.png");
    this.load.image("rope", "assets/branch/rope.jpg");
    this.load.image("udochka", "assets/branch/udochka.png");
    this.load.image("hook", "assets/branch/hook.png");
  }

  create() {
    this.scene.start("Game");
  }
}
