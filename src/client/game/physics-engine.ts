import Box2d from '@supersede/box2d';
import Phaser from 'phaser';
import {
  FIXED_TIMESTEP,
  MAX_STEPS,
  POSITION_ITERATIONS,
  VELOCITY_ITERATIONS,
  WORLD_SCALE,
} from 'src/config/constants';

export class PhysicsEngine {
  private timestepAccumulator = 0;
  private timestepAccumulatorRatio = 0;
  public world: Box2d.b2World;

  constructor() {
    const gravity = new Box2d.b2Vec2(0, 0);
    this.world = new Box2d.b2World(gravity);
    this.world.SetAutoClearForces(false);
  }

  /**
   * Attempts to consume time created by the renderer to step the physics world forward
   * @param deltaTime Time since the last processed frame was processed and the current frame
   */
  fixedStep(deltaTime: number) {
    this.timestepAccumulator += deltaTime;

    const numSteps = Math.floor(this.timestepAccumulator / FIXED_TIMESTEP);
    if (numSteps > 0) {
      // Avoid rounding errors by only touching the accumulator when needed
      this.timestepAccumulator -= numSteps * FIXED_TIMESTEP;
    }
    this.timestepAccumulatorRatio = this.timestepAccumulator / FIXED_TIMESTEP;

    const numStepsClamped = Math.min(numSteps, MAX_STEPS);
    for (let i = 0; i < numStepsClamped; ++i) {
      // reset smooth states
      this.resetSmoothStates();
      this.singleStep(deltaTime);
    }
    this.world.ClearForces();
    this.smoothStates();
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