import Box2d from '@supersede/box2d';
import type * as PIXI from 'pixi.js';
import {Rectangle} from 'src/client/game/debug';
import {TICK_RATE, WORLD_SCALE} from 'src/shared/constants';

export class PhysicsEngine {
  // private static readonly CATEGORY_TERRAIN = 0x0001;
  // private static readonly CATEGORY_PLAYER = 0x0002;
  // private static readonly MASK_PLAYER =
  //   PhysicsEngine.CATEGORY_PLAYER | PhysicsEngine.CATEGORY_PLAYER;
  // private static readonly MASK_TERRAIN = -1; // Collide with everything
  /** Time allotted for a single physics simulation step */
  private static readonly FIXED_TIMESTEP = 1 / TICK_RATE;
  /** Maximum number of steps the physics engine will take in order to avoid the spiral of death. */
  private static readonly MAX_STEPS = 5;
  /** Number of iterations per increment the velocity solver should take (more iterations = higher fidelity) */
  private static readonly VELOCITY_ITERATIONS = 8;
  /** Number iterations per increment the position solver should take (more iterations = higher fidelity) */
  private static readonly POSITION_ITERATIONS = 3;
  private static readonly GROUP_PLAYER = -1; // Do not collide with others of same group
  private static readonly GROUP_TERRAIN = 1; // Always collide with everything else
  private static readonly LINEAR_DAMPING = 10;
  public readonly world: Box2d.b2World;
  public readonly entities: Box2d.b2Body[] = []; // CURRENTLY UNUSED
  public shouldInterpolate = true;
  private timestepAccumulator = 0;
  private timestepAccumulatorRatio = 0;

  public constructor() {
    const gravity = new Box2d.b2Vec2(0, 0);
    this.world = new Box2d.b2World(gravity);
    this.world.SetAutoClearForces(false);
  }

  public createPlayer(): Box2d.b2Body {
    // Shape definition
    const TEMP_WIDTH = 100;
    const TEMP_HEIGHT = 100;
    const shape = new Box2d.b2PolygonShape();
    shape.SetAsBox(TEMP_WIDTH / 2 / WORLD_SCALE, TEMP_HEIGHT / 2 / WORLD_SCALE);

    // Fixture definition
    const fixture = new Box2d.b2FixtureDef();
    fixture.density = 20.0; // MIGHT NOT BE NECESSARY, GIVEN 0 GRAVITY
    fixture.friction = 1.0;
    fixture.shape = shape;
    fixture.filter.groupIndex = PhysicsEngine.GROUP_PLAYER;

    // Body definition
    const body = this.world.CreateBody();
    body.SetType(Box2d.b2BodyType.b2_dynamicBody);
    body.SetLinearDamping(PhysicsEngine.LINEAR_DAMPING);
    body.SetFixedRotation(true); // Prevent angular rotation of bodies
    const TEMP_POSX = 300;
    const TEMP_POSY = 300;
    body.SetPosition(new Box2d.b2Vec2(TEMP_POSX / WORLD_SCALE, TEMP_POSY / WORLD_SCALE));
    body.CreateFixture(fixture);
    return body;
  }

  public TEMP_createBoundary(x1: [number, number], x2: [number, number]): Box2d.b2Body {
    // Shape definition
    const shape = new Box2d.b2EdgeShape();
    shape.SetTwoSided(
      new Box2d.b2Vec2(x1[0] / WORLD_SCALE, x1[1] / WORLD_SCALE),
      new Box2d.b2Vec2(x2[0] / WORLD_SCALE, x2[1] / WORLD_SCALE)
    );

    // Fixture definition
    const fixture = new Box2d.b2FixtureDef();
    fixture.density = 0;
    fixture.shape = shape;
    fixture.filter.groupIndex = PhysicsEngine.GROUP_TERRAIN;

    // Body definition
    const body = this.world.CreateBody();
    body.SetType(Box2d.b2BodyType.b2_staticBody);
    body.CreateFixture(fixture);
    return body;
  }

  /**
   * Attempts to consume time created by the renderer to step the physics world forward
   * @param deltaTime Time since the last processed frame was processed and the current frame
   */
  public fixedStep(deltaTime: number): void {
    this.timestepAccumulator += deltaTime;

    const numSteps = Math.floor(this.timestepAccumulator / PhysicsEngine.FIXED_TIMESTEP);
    if (numSteps > 0) {
      // Avoid rounding errors by only touching the accumulator when needed
      this.timestepAccumulator -= numSteps * PhysicsEngine.FIXED_TIMESTEP;
    }
    this.timestepAccumulatorRatio = this.timestepAccumulator / PhysicsEngine.FIXED_TIMESTEP;

    const numStepsClamped = Math.min(numSteps, PhysicsEngine.MAX_STEPS);
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
      const graphics = b.GetUserData() as Rectangle;
      graphics.x = x * WORLD_SCALE;
      graphics.y = y * WORLD_SCALE;
      graphics.setPrevious(graphics.x, graphics.y);
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
      const gameObject = b.GetUserData() as Rectangle;
      gameObject.x =
        this.timestepAccumulatorRatio * x * WORLD_SCALE + complement * gameObject.previous.x;
      gameObject.y =
        this.timestepAccumulatorRatio * y * WORLD_SCALE + complement * gameObject.previous.y;
    }
  }

  /**
   * Activates physics controllers, calls the world update, and processes collisions
   */
  private singleStep(deltaTime: number) {
    // this.updateControllers(deltaTime);
    this.world.Step(
      PhysicsEngine.FIXED_TIMESTEP,
      PhysicsEngine.VELOCITY_ITERATIONS,
      PhysicsEngine.POSITION_ITERATIONS
    );
    // this.consumeContacts();
  }
}

export function TEMP_createWorldBoundaries(engine: PhysicsEngine) {
  const top = engine.TEMP_createBoundary([5, 5], [600, 5]);
  const bottom = engine.TEMP_createBoundary([5, 600], [600, 600]);
  const right = engine.TEMP_createBoundary([600, 5], [600, 600]);
  const left = engine.TEMP_createBoundary([5, 5], [5, 600]);
}

// {
//   const bodyDef = new Box2d.b2BodyDef();
//   const topSide = this.engine.world.CreateBody(bodyDef);
//   const shape = new Box2d.b2EdgeShape();
//   bodyDef.type = Box2d.b2BodyType.b2_staticBody;
//   shape.SetTwoSided(
//     new Box2d.b2Vec2(5 / WORLD_SCALE, 5 / WORLD_SCALE),
//     new Box2d.b2Vec2(600 / WORLD_SCALE, 5 / WORLD_SCALE)
//   );
//   const fixture = topSide.CreateFixture(shape, 0);
//   const filter = new Box2d.b2Filter();
//   filter.groupIndex = PhysicsEngine.GROUP_TERRAIN;
//   fixture.SetFilterData(filter);
//   const color = new Phaser.Display.Color();
//   color.random().brighten(50).saturate(100);
//   const userData = this.add.graphics();
//   userData.fillStyle(color.color, 1);
//   userData.fillRect(5, 5, 600, 2);
//   topSide.SetUserData(userData);
// }

// // create the left edge
// {
//   const bodyDef = new Box2d.b2BodyDef();
//   const leftSide = this.engine.world.CreateBody(bodyDef);
//   const shape = new Box2d.b2EdgeShape();
//   bodyDef.type = Box2d.b2BodyType.b2_staticBody;
//   shape.SetTwoSided(
//     new Box2d.b2Vec2(5 / WORLD_SCALE, 5 / WORLD_SCALE),
//     new Box2d.b2Vec2(5 / WORLD_SCALE, 600 / WORLD_SCALE)
//   );
//   const fixture = leftSide.CreateFixture(shape, 0);
//   const filter = new Box2d.b2Filter();
//   filter.groupIndex = PhysicsEngine.GROUP_TERRAIN;
//   fixture.SetFilterData(filter);
//   const color = new Phaser.Display.Color();
//   color.random().brighten(50).saturate(100);
//   const userData = this.add.graphics();
//   userData.fillStyle(color.color, 1);
//   userData.fillRect(5, 5, 2, 600);
//   leftSide.SetUserData(userData);
// }

// // create the bottom edge
// {
//   const bodyDef = new Box2d.b2BodyDef();
//   const bottom = this.engine.world.CreateBody(bodyDef);
//   const shape = new Box2d.b2EdgeShape();
//   bodyDef.type = Box2d.b2BodyType.b2_staticBody;
//   shape.SetTwoSided(
//     new Box2d.b2Vec2(5 / WORLD_SCALE, 600 / WORLD_SCALE),
//     new Box2d.b2Vec2(600 / WORLD_SCALE, 600 / WORLD_SCALE)
//   );
//   const fixture = bottom.CreateFixture(shape, 0);
//   const filter = new Box2d.b2Filter();
//   filter.groupIndex = PhysicsEngine.GROUP_TERRAIN;
//   fixture.SetFilterData(filter);
//   const color = new Phaser.Display.Color();
//   color.random().brighten(50).saturate(100);
//   const userData = this.add.graphics();
//   userData.fillStyle(color.color, 1);
//   userData.fillRect(5, 600, 600, 2);
//   bottom.SetUserData(userData);
// }

// // create the right edge
// {
//   const bodyDef = new Box2d.b2BodyDef();
//   const rightSide = this.engine.world.CreateBody(bodyDef);
//   const shape = new Box2d.b2EdgeShape();
//   bodyDef.type = Box2d.b2BodyType.b2_staticBody;
//   shape.SetTwoSided(
//     new Box2d.b2Vec2(600 / WORLD_SCALE, 5 / WORLD_SCALE),
//     new Box2d.b2Vec2(600 / WORLD_SCALE, 600 / WORLD_SCALE)
//   );
//   const fixture = rightSide.CreateFixture(shape, 0);
//   const filter = new Box2d.b2Filter();
//   filter.groupIndex = PhysicsEngine.GROUP_TERRAIN;
//   fixture.SetFilterData(filter);
//   const color = new Phaser.Display.Color();
//   color.random().brighten(50).saturate(100);
//   const userData = this.add.graphics();
//   userData.fillStyle(color.color, 1);
//   userData.fillRect(600, 5, 2, 600);
//   rightSide.SetUserData(userData);
// }
