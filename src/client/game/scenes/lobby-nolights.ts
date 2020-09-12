import * as box2d from '@supersede/box2d';
import Phaser from 'phaser';
import {GameControls} from 'src/config/types';

const TIME_STEP = 1 / 60;
const VELOCITY_ITERATIONS = 8;
const POSITION_ITERATIONS = 3;
const WORLD_SCALE = 30; // 30 pixels = 1 meter

const game = {
  config: {
    width: 600,
    height: 600,
  },
};

export class Lobby extends Phaser.Scene {
  public controls: GameControls;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private player: [box2d.b2Body, Phaser.GameObjects.Graphics];
  private sides: box2d.b2Body;

  // b2 code stuffs
  private world: box2d.b2World;
  private playerPhysicsBody: box2d.b2Body;

  private worldScale: number = 30;
  private accumulator = 0;

  constructor(controls: GameControls) {
    super('PlayGame');
    this.controls = controls;
  }

  init() {
    const {up, left, down, right} = this.controls;
    this.cursors = this.input.keyboard.addKeys({up, left, down, right});
  }

  create() {
    // Box2D works with meters. We need to convert meters to pixels.
    // let's say 30 pixels = 1 meter.

    // world gravity, as a Vec2 object. It's just a x, y vector
    let gravity = new box2d.b2Vec2(0, 0);

    // this is how we create a Box2D world
    this.world = new box2d.b2World(gravity);

    // createBox is a method I wrote to create a box, see how it works at line 55
    this.createBox(game.config.width / 2, game.config.height - 20, game.config.width, 40, false);

    this.player = this.createBox(game.config.width / 2, game.config.height - 20, 50, 50, true);

    // the rest of the script just creates a random box each 500ms, then restarts after 100 iterations
    // let tick = 0;
    // this.time.addEvent({
    //   delay: 2000,
    //   callbackScope: this,
    //   callback: function () {
    //     this.createBox(
    //       Phaser.Math.Between(100, game.config.width - 100),
    //       -100,
    //       Phaser.Math.Between(20, 80),
    //       Phaser.Math.Between(20, 80),
    //       true
    //     );
    //     tick++;
    //     if (tick === 100) {
    //       this.scene.start('PlayGame');
    //     }
    //   },
    //   loop: true,
    // });
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
  ): [box2d.b2Body, Phaser.GameObjects.Graphics] {
    // this is how we create a generic Box2D body
    let box = this.world.CreateBody();
    if (isDynamic) {
      // Box2D bodies born as static bodies, but we can make them dynamic
      box.SetType(box2d.b2BodyType.b2_dynamicBody);
      box.SetLinearDamping(8);
    }

    // a body can have one or more fixtures. This is how we create a box fixture inside a body
    const boxShape = new box2d.b2PolygonShape();
    boxShape.SetAsBox(width / 2 / this.worldScale, height / 2 / this.worldScale);
    const fixtureDef = new box2d.b2FixtureDef();
    fixtureDef.density = 20.0;
    fixtureDef.friction = 1.0;
    fixtureDef.shape = boxShape;
    box.CreateFixture(fixtureDef);

    // now we place the body in the world
    box.SetPosition(new box2d.b2Vec2(posX / this.worldScale, posY / this.worldScale));

    // time to set mass information
    box.SetMassData({
      mass: 1,
      center: new box2d.b2Vec2(),
      I: 1, // if you set it to zero, bodies won't rotate
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

  // fixed time step
  doPhysicsStep(deltaTime: number) {
    // max frame time to avoid spiral of death (on slow devices)
    const frameTime = Math.min(deltaTime, 0.25);
    this.accumulator += frameTime;
    while (this.accumulator >= TIME_STEP) {
      this.world.Step(TIME_STEP, VELOCITY_ITERATIONS, POSITION_ITERATIONS);
      this.accumulator -= TIME_STEP;
    }
  }

  update() {
    if (this.cursors.right?.isDown) {
      this.player[0].SetLinearVelocity(new box2d.b2Vec2(120 / this.worldScale, 0));
    } else if (this.cursors.left?.isDown) {
      this.player[0].SetLinearVelocity(new box2d.b2Vec2(-120 / this.worldScale, 0));
    }

    if (this.cursors.down?.isDown) {
      this.player[0].SetLinearVelocity(new box2d.b2Vec2(0, 120 / this.worldScale));
    } else if (this.cursors.up?.isDown) {
      this.player[0].SetLinearVelocity(new box2d.b2Vec2(0, -120 / this.worldScale));
    }

    // advance the simulation by 1/20 seconds
    this.world.Step(TIME_STEP, VELOCITY_ITERATIONS, POSITION_ITERATIONS);

    // crearForces  method should be added at the end on each step
    this.world.ClearForces();

    // iterate through all bodies
    for (let b = this.world.GetBodyList(); b; b = b.GetNext()) {
      // get body position
      const bodyPosition = b.GetPosition();
      // get body user data, the graphics object
      const userData = b.GetUserData();
      // adjust graphic object position and rotation
      userData.x = bodyPosition.x * this.worldScale;
      userData.y = bodyPosition.y * this.worldScale;
      userData.rotation = b.GetAngle();
    }
  }

  // init() {
  //   this.setupControls();
  // }

  // setupControls() {
  //   const {up, left, down, right} = this.controls;
  //   this.cursors = this.input.keyboard.addKeys({up, left, down, right});
  // }
}
