import Phaser from 'phaser';
import Box2d from '@supersede/box2d';
import {GameControls} from 'src/shared/types';
import {WORLD_SCALE} from 'src/shared/constants';
import {PhysicsEngine} from 'src/shared/physics-engine';
import {bufferChannel, channel} from 'src/client/networking/udp';

export class Lobby extends Phaser.Scene {
  public controls: GameControls;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: [Box2d.b2Body, Phaser.GameObjects.Graphics];
  private grid: Phaser.GameObjects.Grid;
  private engine: PhysicsEngine;

  constructor(controls: GameControls) {
    super('PlayGame');
    this.controls = controls;
    this.engine = new PhysicsEngine();
  }

  init() {
    const {up, left, down, right} = this.controls;
    this.cursors = this.input.keyboard.addKeys({up, left, down, right});
  }

  create() {
    // create grid stuffs
    this.grid = this.add.grid(0, 0, 1000, 1000, 32, 32, 0xffffff, 0, 0xff0000, 0.5);
    this.grid.showOutline = true;
    this.grid.showCells = false;
    this.grid.setVisible(true);
    this.grid.setOrigin(0, 0);

    // create the top ceiling edge
    {
      const bodyDef = new Box2d.b2BodyDef();
      const ground = this.engine.world.CreateBody(bodyDef);
      const shape = new Box2d.b2EdgeShape();
      bodyDef.type = Box2d.b2BodyType.b2_staticBody;
      shape.SetTwoSided(
        new Box2d.b2Vec2(5 / WORLD_SCALE, 5 / WORLD_SCALE),
        new Box2d.b2Vec2(600 / WORLD_SCALE, 5 / WORLD_SCALE)
      );
      ground.CreateFixture(shape, 0);
      const color = new Phaser.Display.Color();
      color.random().brighten(50).saturate(100);
      const userData = this.add.graphics();
      userData.fillStyle(color.color, 1);
      userData.fillRect(5, 5, 600, 2);
      ground.SetUserData(userData);
    }

    // create the left edge
    {
      const bodyDef = new Box2d.b2BodyDef();
      const leftSide = this.engine.world.CreateBody(bodyDef);
      const shape = new Box2d.b2EdgeShape();
      bodyDef.type = Box2d.b2BodyType.b2_staticBody;
      shape.SetTwoSided(
        new Box2d.b2Vec2(5 / WORLD_SCALE, 5 / WORLD_SCALE),
        new Box2d.b2Vec2(5 / WORLD_SCALE, 600 / WORLD_SCALE)
      );
      leftSide.CreateFixture(shape, 0);
      const color = new Phaser.Display.Color();
      color.random().brighten(50).saturate(100);
      const userData = this.add.graphics();
      userData.fillStyle(color.color, 1);
      userData.fillRect(5, 5, 2, 600);
      leftSide.SetUserData(userData);
    }

    // create the bottom edge
    {
      const bodyDef = new Box2d.b2BodyDef();
      const bottom = this.engine.world.CreateBody(bodyDef);
      const shape = new Box2d.b2EdgeShape();
      bodyDef.type = Box2d.b2BodyType.b2_staticBody;
      shape.SetTwoSided(
        new Box2d.b2Vec2(5 / WORLD_SCALE, 600 / WORLD_SCALE),
        new Box2d.b2Vec2(600 / WORLD_SCALE, 600 / WORLD_SCALE)
      );
      bottom.CreateFixture(shape, 0);
      const color = new Phaser.Display.Color();
      color.random().brighten(50).saturate(100);
      const userData = this.add.graphics();
      userData.fillStyle(color.color, 1);
      userData.fillRect(5, 600, 600, 2);
      bottom.SetUserData(userData);
    }

    // create the right edge
    {
      const bodyDef = new Box2d.b2BodyDef();
      const rightSide = this.engine.world.CreateBody(bodyDef);
      const shape = new Box2d.b2EdgeShape();
      bodyDef.type = Box2d.b2BodyType.b2_staticBody;
      shape.SetTwoSided(
        new Box2d.b2Vec2(600 / WORLD_SCALE, 5 / WORLD_SCALE),
        new Box2d.b2Vec2(600 / WORLD_SCALE, 600 / WORLD_SCALE)
      );
      rightSide.CreateFixture(shape, 0);
      const color = new Phaser.Display.Color();
      color.random().brighten(50).saturate(100);
      const userData = this.add.graphics();
      userData.fillStyle(color.color, 1);
      userData.fillRect(600, 5, 2, 600);
      rightSide.SetUserData(userData);
    }

    this.player = this.createBox(300, 300, 100, 100, true);

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const pos = this.player[0].GetPosition();
        console.log(`${pos.x}, ${pos.y}`);
      },
    });
  }

  // here we go with some Box2D stuff
  // arguments: x, y coordinates of the center, with and height of the box, in pixels
  // we'll conver pixels to meters inside the method
  createBox(
    posX: number,
    posY: number,
    width: number,
    height: number,
    isDynamic: boolean
  ): [Box2d.b2Body, Phaser.GameObjects.Graphics] {
    // this is how we create a generic Box2D body
    let box = this.engine.world.CreateBody();
    if (isDynamic) {
      // Box2D bodies born as static bodies, but we can make them dynamic
      box.SetType(Box2d.b2BodyType.b2_dynamicBody);
      box.SetLinearDamping(10);
      box.SetFixedRotation(true);
    }

    // a body can have one or more fixtures. This is how we create a box fixture inside a body
    const boxShape = new Box2d.b2PolygonShape();
    boxShape.SetAsBox(width / 2 / WORLD_SCALE, height / 2 / WORLD_SCALE);
    const fixtureDef = new Box2d.b2FixtureDef();
    fixtureDef.density = 20.0;
    fixtureDef.friction = 1.0;
    fixtureDef.shape = boxShape;
    box.CreateFixture(fixtureDef);

    // now we place the body in the world
    box.SetPosition(new Box2d.b2Vec2(posX / WORLD_SCALE, posY / WORLD_SCALE));

    // time to set mass information
    box.SetMassData({
      mass: 1,
      center: new Box2d.b2Vec2(),
      I: 0, // if you set it to zero, bodies won't rotate
    });

    // now we create a graphics object representing the body
    const color = new Phaser.Display.Color();
    color.random();
    color.brighten(50).saturate(100);
    let userData = this.add.graphics();
    userData.fillStyle(color.color, 1);
    userData.fillRect(-width / 2, -height / 2, width, height);

    // a body can have anything in its user data, normally it's used to store its sprite
    box.SetUserData(userData);

    return [box, userData];
  }

  receiveNetwork() {
    channel.on('update', (data) => {
      const buffer = data as ArrayBuffer;

    });
  }

  setPlayerVelocity() {
    const vector = new Box2d.b2Vec2();
    const movementUnit = 90 / WORLD_SCALE;

    // Determine horizontal velocity
    if (this.cursors.right!.isDown) {
      vector.Set(movementUnit, 0);
    } else if (this.cursors.left!.isDown) {
      vector.Set(-movementUnit, 0);
    }
    // Determine vertical velocity
    if (this.cursors.down!.isDown) {
      vector.Set(vector.x, movementUnit);
    } else if (this.cursors.up!.isDown) {
      vector.Set(vector.x, -movementUnit);
    }

    this.player[0].SetLinearVelocity(vector);
  }

  processPlayerInput() {
    // Determine horizontal velocity
    if (this.cursors.right!.isDown) {
      bufferChannel.right();
    } else if (this.cursors.left!.isDown) {
      bufferChannel.left();
    }

    // Determine vertical velocity
    if (this.cursors.up!.isDown) {
      bufferChannel.up();
    } else if (this.cursors.down!.isDown) {
      bufferChannel.down();
    }

    if (!bufferChannel.isEmpty()) {
      bufferChannel.emit();
    }
  }

  processInputs() {
    const nowTs = new Date().getTime();
    const lastTs = this.lastTs || nowTs;
    const deltaTimeSec = (nowTs - lastTs) / 1000.0;
  }

  update(currentTime: number, deltaTime: number) {
    this.processPlayerInput();
    this.engine.fixedStep(deltaTime);
  }
}
