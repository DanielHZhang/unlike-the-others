import Box2d from '@supersede/box2d';
import Phaser from 'phaser';
import {
  FIXED_TIMESTEP,
  MAX_STEPS,
  POSITION_ITERATIONS,
  VELOCITY_ITERATIONS,
  WORLD_SCALE,
} from 'src/shared/constants';

export class PhysicsEngine {
  private static readonly LINEAR_DAMPING = 10;
  private timestepAccumulator = 0;
  private timestepAccumulatorRatio = 0;
  public readonly world: Box2d.b2World;
  public readonly entities: Box2d.b2Body[] = []; // CURRENTLY UNUSED
  public shouldInterpolate = true;

  constructor() {
    const gravity = new Box2d.b2Vec2(0, 0);
    this.world = new Box2d.b2World(gravity);
    this.world.SetAutoClearForces(false);
  }

  public createPlayer() {
    // Body definition
    const body = this.world.CreateBody();
    body.SetType(Box2d.b2BodyType.b2_dynamicBody);
    body.SetLinearDamping(PhysicsEngine.LINEAR_DAMPING);
    body.SetFixedRotation(true); // Prevent angular rotation of bodies
    // body.SetMassData({
    //   mass: 1,
    //   center: new Box2d.b2Vec2(),
    //   I: 0, // if you set it to zero, bodies won't rotate
    // });
    const TEMP_POSX = 300;
    const TEMP_POSY = 300;
    body.SetPosition(new Box2d.b2Vec2(TEMP_POSX / WORLD_SCALE, TEMP_POSY / WORLD_SCALE));

    // Shape definition
    const TEMP_WIDTH = 50;
    const TEMP_HEIGHT = 50;
    const shape = new Box2d.b2PolygonShape();
    shape.SetAsBox(TEMP_WIDTH / 2 / WORLD_SCALE, TEMP_HEIGHT / 2 / WORLD_SCALE);

    // Fixture definition
    const fixture = new Box2d.b2FixtureDef();
    fixture.density = 20.0;
    fixture.friction = 1.0;
    fixture.shape = shape;
    body.CreateFixture(fixture);
    return body;
  }

  /**
   * Attempts to consume time created by the renderer to step the physics world forward
   * @param deltaTime Time since the last processed frame was processed and the current frame
   */
  public fixedStep(deltaTime: number) {
    this.timestepAccumulator += deltaTime;

    const numSteps = Math.floor(this.timestepAccumulator / FIXED_TIMESTEP);
    if (numSteps > 0) {
      // Avoid rounding errors by only touching the accumulator when needed
      this.timestepAccumulator -= numSteps * FIXED_TIMESTEP;
    }
    this.timestepAccumulatorRatio = this.timestepAccumulator / FIXED_TIMESTEP;

    const numStepsClamped = Math.min(numSteps, MAX_STEPS);
    for (let i = 0; i < numStepsClamped; ++i) {
      if (this.shouldInterpolate) {
        this.resetSmoothStates(); // Reset position to before interpolation
      }
      this.singleStep(deltaTime);
    }
    this.world.ClearForces();
    if (this.shouldInterpolate) {
      this.smoothStates(); // Perform linear interpolation
    }
  }

  /**
   * Store the previous known state in the game object
   */
  private resetSmoothStates() {
    for (let b = this.world.GetBodyList(); b !== null; b = b.GetNext()) {
      if (b.GetType() === Box2d.b2BodyType.b2_staticBody) {
        continue;
      }
      const {x, y} = b.GetPosition();
      const gameObject = b.GetUserData() as Phaser.GameObjects.Graphics;
      gameObject.x = x * WORLD_SCALE;
      gameObject.y = y * WORLD_SCALE;
      gameObject.setData({prevX: gameObject.x, prevY: gameObject.y});
    }
  }

  /**
   * Compute a linearly-interpolated state from the last two known states
   * Note: inputs will always be lagged one sub-step of `FIXED_TIMESTEP`
   */
  private smoothStates() {
    const complement = 1 - this.timestepAccumulatorRatio;
    for (let b = this.world.GetBodyList(); b !== null; b = b.GetNext()) {
      if (b.GetType() === Box2d.b2BodyType.b2_staticBody) {
        continue; // Ignore static bodies
      }
      const {x, y} = b.GetPosition();
      const gameObject = b.GetUserData() as Phaser.GameObjects.Graphics;
      gameObject.x =
        this.timestepAccumulatorRatio * x * WORLD_SCALE + complement * gameObject.data.values.prevX;
      gameObject.y =
        this.timestepAccumulatorRatio * y * WORLD_SCALE + complement * gameObject.data.values.prevY;
    }
  }

  /**
   * Activates physics controllers, calls the world update, and processes collisions
   */
  private singleStep(deltaTime: number) {
    // this.updateControllers(deltaTime);
    this.world.Step(FIXED_TIMESTEP, VELOCITY_ITERATIONS, POSITION_ITERATIONS);
    // this.consumeContacts();
  }
}
