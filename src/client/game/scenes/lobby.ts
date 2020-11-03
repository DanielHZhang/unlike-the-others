import * as box2d from '@plane2d/core';
import type {Keybindings} from 'src/shared/types';
import {Player} from 'src/client/game/scenes/player';
import {RaycastPolygon} from 'src/client/game/scenes/raycasting';

const VisibilityPolygon = new RaycastPolygon();

// game options
const gameOptions = {
  // number of boxes in the game
  boxes: 10,

  // size of each box
  sizeRange: {
    // min size, in pixels
    min: 50,

    // max size, in pixels
    max: 120,
  },
};

const WORLD_SCALE = 30; // 30 pixels = 1 meter

export class Lobby extends Phaser.Scene {
  public controls: Keybindings;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: Phaser.GameObjects.Graphics;
  // private vision: Phaser.GameObjects.Image;
  private light: Phaser.GameObjects.Graphics;
  private walls: Phaser.GameObjects.Graphics;
  private sides: box2d.b2Body;
  private polygons: number[][][];

  // b2 code stuffs
  private world: box2d.b2World;
  private playerPhysicsBody: box2d.b2Body;

  constructor(controls: Keybindings, config: Phaser.Types.Scenes.SettingsConfig = {}) {
    super(config);
    this.controls = controls;
    this.cursors = {};
    // this.player = this.physics.add.sprite(0, 0, 'player');
    // @ts-ignore
    this.player = {};
    // @ts-ignore
    this.light = {};
    // @ts-ignore
    this.sides = {};
    this.polygons = [];

    // Box2d code
    const gravity = new box2d.b2Vec2(0, 0);
    this.world = new box2d.b2World(gravity);

    // Bounding box
    {
      const bodyDef = new box2d.b2BodyDef();
      this.sides = this.world.CreateBody(bodyDef);

      const shape = new box2d.b2EdgeShape();
      shape.SetTwoSided(new box2d.b2Vec2(-20.0, 0.0), new box2d.b2Vec2(20.0, 0.0));
      this.sides.CreateFixture(shape, 0.0);
      this.sides.SetPosition(new box2d.b2Vec2(2, 2));
    }

    // PLAYER
    {
      const bodyDef = new box2d.b2BodyDef();
      bodyDef.position.Set(-3.0, 8.0);
      bodyDef.type = box2d.b2BodyType.b2_dynamicBody;
      bodyDef.fixedRotation = true;
      bodyDef.allowSleep = false;
      this.playerPhysicsBody = this.world.CreateBody(bodyDef);
      const shape = new box2d.b2PolygonShape();
      shape.SetAsBox(1, 1);
    }
  }

  setupControls() {
    const {up, left, down, right} = this.controls;
    this.cursors = this.input.keyboard.addKeys({up, left, down, right});
  }

  init() {
    this.setupControls();
  }

  preload() {
    // Load assets
  }

  create() {
    // SOEM BOX2D STUFF
    // now we create a graphics object representing the body
    const color = new Phaser.Display.Color();
    color.random();
    color.brighten(50).saturate(100);
    const userData = this.add.graphics();
    userData.fillStyle(color.color, 1);
    userData.fillRect(2, 2, 20, 20);
    this.sides.SetUserData(userData);

    // graphic object used to draw walls
    this.walls = this.add.graphics();
    this.walls.lineStyle(1, 0x00ff00);

    // graphic object used to draw rays of light
    this.light = this.add.graphics();

    // array with all polygons in game
    this.polygons = [];

    // player init
    this.player = this.add.graphics();
    this.player.fillStyle(0x33a2ff);
    this.player.fillRect(50, 50, 50, 80);

    // add random boxes
    for (let i = 0; i < gameOptions.boxes; i++) {
      this.addRandomBox();
    }

    // walls around game perimeter
    this.polygons.push([
      [-1, -1],
      [(this.game.config.width as number) + 1, -1],
      [(this.game.config.width as number) + 1, (this.game.config.height as number) + 1],
      [-1, (this.game.config.height as number) + 1],
    ]);
  }

  renderLights(x: number, y: number) {
    // determine light polygon starting from pointer coordinates
    const visibility = this.createLightPolygon(x, y);
    if (!visibility) {
      throw new Error('no visibility');
    }
    // clear and prepare lightGraphics graphic object
    this.light.clear();
    this.light.lineStyle(2, 0xff8800);
    this.light.fillStyle(0xffffff);

    // begin a drawing path
    this.light.beginPath();

    // move the graphic pen to first vertex of light polygon
    this.light.moveTo(visibility[0][0], visibility[0][1]);

    // loop through all light polygon vertices
    for (let i = 1; i <= visibility.length; i++) {
      // draw a line to i-th light polygon vertex
      this.light.lineTo(visibility[i % visibility.length][0], visibility[i % visibility.length][1]);
    }

    // close, stroke and fill light polygon
    this.light.closePath();
    this.light.fillPath();
    this.light.strokePath();
  }

  update(time: number, delta: number) {
    // BOX2D RERENDER STUFF
    this.world.Step(1 / 60, 8, 3);
    this.world.ClearForces(); // called at the end of each step

    for (let b = this.world.GetBodyList(); b; b = b.GetNext()) {
      // get stuff about body here
    }

    // other player movement stuff
    const oldX = this.player.x;
    const oldY = this.player.y;

    if (this.cursors.right?.isDown) {
      this.player.setPosition(this.player.x + 5, this.player.y);
    } else if (this.cursors.left?.isDown) {
      this.player.setPosition(this.player.x - 5, this.player.y);
    }

    if (this.cursors.down?.isDown) {
      this.player.setPosition(this.player.x, this.player.y + 5);
    } else if (this.cursors.up?.isDown) {
      this.player.setPosition(this.player.x, this.player.y - 5);
    }

    if (oldX !== this.player.x || oldY !== this.player.y) {
      this.renderLights(this.player.x, this.player.y);
    }
    //   if (this.cursors.right?.isDown) {
    //     this.player?.setVelocityX(160);
    //   } else if (this.cursors.left?.isDown) {
    //     this.player?.setVelocityX(-160);
    //   }
    //   if (this.cursors.down?.isDown) {
    //     this.player?.setVelocityY(160);
    //   } else if (this.cursors.up?.isDown) {
    //     this.player?.setVelocityY(-160);
    //   }
  }

  // method to add a random box
  addRandomBox() {
    // use a do...while statement because there can't be intersecting polygons
    const {config} = this.game;
    let startX, startY, width, height;
    do {
      // random x and y coordinates, width and height
      startX = Phaser.Math.Between(10, (config.width as number) - 10 - gameOptions.sizeRange.max);
      startY = Phaser.Math.Between(10, (config.height as number) - 10 - gameOptions.sizeRange.max);
      width = Phaser.Math.Between(gameOptions.sizeRange.min, gameOptions.sizeRange.max);
      height = Phaser.Math.Between(gameOptions.sizeRange.min, gameOptions.sizeRange.max);

      // check if current box intersects other boxes
    } while (this.boxesIntersect(startX, startY, width, height));

    // draw the box
    this.walls.strokeRect(startX, startY, width, height);

    // insert box vertices into polygons array
    this.polygons.push([
      [startX, startY],
      [startX + width, startY],
      [startX + width, startY + height],
      [startX, startY + height],
    ]);
  }

  // method to check if the box intersects other boxes
  boxesIntersect(x: number, y: number, w: number, h: number) {
    // loop through existing boxes
    for (let i = 0; i < this.polygons.length; i++) {
      // if the box intersects the existing i-th box...
      if (
        x < this.polygons[i][1][0] &&
        x + w > this.polygons[i][0][0] &&
        y < this.polygons[i][3][1] &&
        y + h > this.polygons[i][0][1]
      ) {
        // return true
        return true;
      }
    }
    // if we reach the end of the loop, return false
    return false;
  }

  // method to create light polygon using visibility_polygon.js
  createLightPolygon(x: number, y: number) {
    if (!this.polygons) {
      throw new Error('polygons not defined');
    }
    let segments = VisibilityPolygon.convertToSegments(this.polygons);
    segments = VisibilityPolygon.breakIntersections(segments);
    const position = [x, y];
    if (VisibilityPolygon.inPolygon(position, this.polygons[this.polygons.length - 1])) {
      return VisibilityPolygon.compute(position, segments);
    }
    return null;
  }
}
