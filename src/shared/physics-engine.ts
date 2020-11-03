// import Box2D from '@supersede/Box2D';
import Box2D from '@plane2d/core';
import type * as PIXI from 'pixi.js';
import {Rectangle} from 'src/client/game/debug';
import {DynamicEntity} from 'src/client/game/entities/base';
import {WORLD_SCALE} from 'src/shared/constants';

// private static readonly CATEGORY_TERRAIN = 0x0001;
// private static readonly CATEGORY_PLAYER = 0x0002;
// private static readonly MASK_PLAYER =
//   PhysicsEngine.CATEGORY_PLAYER | PhysicsEngine.CATEGORY_PLAYER;
// private static readonly MASK_TERRAIN = -1; // Collide with everything

export class PhysicsEngine {
  /** Time in ms allotted for a single physics simulation step. Corresponds with a tick rate of 60. */
  public static readonly FIXED_TIMESTEP = 16.66;
  /** Maximum number of steps the physics engine will take in order to avoid the spiral of death. */
  private static readonly MAX_STEPS = 6;
  /** Number of iterations per increment the velocity solver should take (more iterations = higher fidelity) */
  private static readonly VELOCITY_ITERATIONS = 8;
  /** Number iterations per increment the position solver should take (more iterations = higher fidelity) */
  private static readonly POSITION_ITERATIONS = 3;
  private static readonly GROUP_PLAYER = -1; // Do not collide with others of same group
  private static readonly GROUP_TERRAIN = 1; // Always collide with everything else
  private static readonly LINEAR_DAMPING = 10;
  public readonly world: Box2D.b2World;
  public readonly entities: Box2D.b2Body[] = []; // CURRENTLY UNUSED
  public shouldInterpolate = true;
  public currentStep = 0;
  private readonly updateControllers: () => void;
  private timestepAccumulator = 0;
  private timestepAccumulatorRatio = 0;

  public constructor(updateControllers: () => void) {
    this.updateControllers = updateControllers;
    this.world = Box2D.b2World.Create({x: 0, y: 0});
    this.world.SetAutoClearForces(false);
  }

  // public createBody(): Box2D.b2Body {
  // }

  public createPlayerBody(): Box2D.b2Body {
    // Shape definition
    const TEMP_WIDTH = 100;
    const TEMP_HEIGHT = 100;
    const shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(TEMP_WIDTH / 2 / WORLD_SCALE, TEMP_HEIGHT / 2 / WORLD_SCALE);

    // Body definition
    const body = this.world.CreateBody({
      type: Box2D.b2BodyType.b2_dynamicBody,
      linearDamping: PhysicsEngine.LINEAR_DAMPING,
      fixedRotation: true, // Prevent angular rotation of bodies
    });

    const TEMP_POSX = 300;
    const TEMP_POSY = 300;
    body.SetPosition({x: TEMP_POSX / WORLD_SCALE, y: TEMP_POSY / WORLD_SCALE});
    body.CreateFixture({
      shape,
      density: 20.0, // MIGHT NOT BE NECESSARY, GIVEN 0 GRAVITY
      friction: 1.0,
      filter: {groupIndex: PhysicsEngine.GROUP_PLAYER},
    });
    return body;
  }

  public TEMP_createBoundary(x1: [number, number], x2: [number, number]): Box2D.b2Body {
    // Shape definition
    const shape = new Box2D.b2EdgeShape();
    shape.SetTwoSided(
      new Box2D.b2Vec2(x1[0] / WORLD_SCALE, x1[1] / WORLD_SCALE),
      new Box2D.b2Vec2(x2[0] / WORLD_SCALE, x2[1] / WORLD_SCALE)
    );

    // Body definition
    const body = this.world.CreateBody();
    body.SetType(Box2D.b2BodyType.b2_staticBody);
    body.CreateFixture({
      density: 0,
      shape,
      filter: {groupIndex: PhysicsEngine.GROUP_TERRAIN},
    });
    return body;
  }

  /**
   * Attempts to consume time created by the renderer to step the physics world forward.
   * @param deltaTime Time in milliseconds from the last frame to the current frame.
   */
  public fixedStep(deltaTime: number): void {
    this.timestepAccumulator += deltaTime;

    const numSteps = Math.floor(this.timestepAccumulator / PhysicsEngine.FIXED_TIMESTEP);
    if (numSteps > 0) {
      // Avoid rounding errors by only touching the accumulator when needed
      this.timestepAccumulator -= numSteps * PhysicsEngine.FIXED_TIMESTEP;
    }
    if (this.timestepAccumulator >= PhysicsEngine.FIXED_TIMESTEP + Number.EPSILON) {
      console.warn('Accumulator must have value lesser than the fixed time step.');
    }

    this.timestepAccumulatorRatio = this.timestepAccumulator / PhysicsEngine.FIXED_TIMESTEP;
    const numStepsClamped = Math.min(numSteps, PhysicsEngine.MAX_STEPS);
    if (numStepsClamped > 2) {
      console.log('Num steps:', numStepsClamped);
    }

    if (this.shouldInterpolate) {
      this.resetSmoothStates(); // Reset position to before interpolation
    }
    for (let i = 0; i < numStepsClamped; i++) {
      this.singleStep();
    }
    this.world.ClearForces();
    if (this.shouldInterpolate) {
      this.smoothStates(); // Perform linear interpolation
    }
  }

  /**
   * Activates physics controllers, calls the world update, and processes collisions.
   */
  private singleStep() {
    this.updateControllers();
    this.world.Step(PhysicsEngine.FIXED_TIMESTEP / 1000, {
      velocityIterations: PhysicsEngine.VELOCITY_ITERATIONS,
      positionIterations: PhysicsEngine.POSITION_ITERATIONS,
    });
    this.currentStep++;
    // this.consumeContacts();
  }

  /**
   * Store the previous known state in the game object.
   */
  private resetSmoothStates() {
    for (let b = this.world.GetBodyList(); b !== null; b = b.GetNext()) {
      if (b.GetType() === Box2D.b2BodyType.b2_staticBody) {
        continue; // Ignore static bodies
      }
      const entity = b.GetUserData() as DynamicEntity;
      const {sceneX, sceneY} = entity.getScenePosition();
      entity.x = sceneX;
      entity.y = sceneY;
      entity.setPrevPosition(sceneX, sceneY);
    }
  }

  /**
   * Compute a linearly-interpolated state from the last two known states.
   * Note: inputs will always be lagged one sub-step of `FIXED_TIMESTEP`.
   */
  private smoothStates() {
    for (let b = this.world.GetBodyList(); b !== null; b = b.GetNext()) {
      if (b.GetType() === Box2D.b2BodyType.b2_staticBody) {
        continue; // Ignore static bodies
      }
      const entity = b.GetUserData() as DynamicEntity;
      entity.lerp(this.timestepAccumulatorRatio);
    }
  }
}

export function TEMP_createWorldBoundaries(engine: PhysicsEngine) {
  const top = engine.TEMP_createBoundary([5, 5], [600, 5]);
  const bottom = engine.TEMP_createBoundary([5, 600], [600, 600]);
  const right = engine.TEMP_createBoundary([600, 5], [600, 600]);
  const left = engine.TEMP_createBoundary([5, 5], [5, 600]);
}
