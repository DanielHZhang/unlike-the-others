import * as PIXI from 'pixi.js';
import {Line} from 'src/client/game/debug';
import {EntityManager} from 'src/client/game/entities';
import {KeyboardManager} from 'src/client/game/keyboard';
import {connection} from 'src/client/network';
import {snapshotModel} from 'src/shared/buffer-schema';
import {Movement} from 'src/shared/constants';
import {PhysicsEngine} from 'src/shared/physics-engine';
import {InputData, Keybindings} from 'src/shared/types';

export class Game extends PIXI.Application {
  private engine: PhysicsEngine;
  private keyboard: KeyboardManager;
  private entities: EntityManager;
  private camera: PIXI.Container;

  public constructor(view: HTMLCanvasElement, keybindings: Keybindings) {
    super({
      antialias: true,
      resolution: 1,
      view,
    });
    this.engine = new PhysicsEngine(this.TEST_processInput.bind(this));
    this.keyboard = new KeyboardManager(keybindings);

    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.ticker.add(this.update);
    this.ticker.maxFPS = 30;

    const camera = new PIXI.Container();
    camera.position.set(this.renderer.screen.width / 2, this.renderer.screen.height / 2);
    // camera.pivot.copyFrom();
    this.stage.addChild(camera);
    this.camera = camera;

    this.entities = new EntityManager(this.engine, camera);

    const floorplan = this.loader
      .add('floorplan', 'http://localhost:8080/assets/floorplan.jpg')
      .load(() => {
        const background = new PIXI.Sprite(this.loader.resources.floorplan.texture);
        this.camera.addChild(background);
        this.camera.addChild(this.entities.mainPlayer.sprite);
      });

    // let map = new PIXI.Rectangle();
    // map.x = camera.pivot.x - this.renderer.screen.width / 2;
    // map.y = camera.pivot.x - this.renderer.screen.height / 2;
    // map.width = this.renderer.screen.width;
    // map.height = this.renderer.screen.height;
    // map.pad(400, 400);

    // // every time camera changes position

    // const newRect = new PIXI.Rectangle();
    // newRect.x = camera.pivot.x - this.renderer.screen.width / 2;
    // newRect.y = camera.pivot.x - this.renderer.screen.height / 2;
    // newRect.width = this.renderer.screen.width;
    // newRect.height = this.renderer.screen.height;
    // if (
    //   newRect.x < map.x ||
    //   newRect.right > map.right ||
    //   newRect.y < map.y ||
    //   newRect.bottom > map.bottom
    // ) {
    //   map = newRect;
    //   // ADJUST THE BACKGROUND AND STUFF
    // }

    // const lobby = new PIXI.Container();
    // this.stage.addChild(lobby);

    // const main = new PIXI.Container();
    // main.visible = false;
    // this.stage.addChild(main);

    // if (connection.isOpen()) {
    //   connection.onRaw(this.entities.receiveNetwork);
    // }

    // const baseTexture = new PIXI.BaseTexture(rawImageHere);
    // app.loader.onProgress.add((loader, resource) => console.log('progress:', loader, resource));
    // app.loader.add(['wow']).load(() => null); // load via blob/encrypted type here
    // const sprite = app.loader.resources['wow'].texture;

    // const rectangle = new PIXI.Graphics();
    // rectangle.lineStyle(4, 0xff3300, 1);
    // rectangle.beginFill(0x66ccff);
    // rectangle.drawRect(0, 0, 64, 64);
    // rectangle.endFill();
    // rectangle.x = 170;
    // rectangle.y = 170;
    // app.stage.addChild(rectangle);

    // const line = new Line([200, 150, 0, 0], undefined, 0xffffff);
    // this.stage.addChild(line);
  }

  /**
   * Update keyboard bindings for player controls.
   */
  public updateKeybindings(newBindings: Keybindings): void {
    this.keyboard.setBindings(newBindings);
  }

  /**
   * Keydown event handler.
   */
  public keydown = (event: KeyboardEvent): void => {
    // console.log('Keydown:', event.key);
    this.keyboard.processKeyDown(event.code, event.key);
    // event.preventDefault();
  };

  /**
   * Keyup event handler.
   */
  public keyup = (event: KeyboardEvent): void => {
    // console.log('Keyup:', event.key);
    this.keyboard.processKeyUp(event.code, event.key);
    // event.preventDefault();
  };

  private startTime = Date.now();

  /**
   * Update function of the game loop.
   * @param deltaTime `ticker.deltaTime` Scalar time value from last frame to this frame.
   */
  private update = (deltaTime: number): void => {
    // console.log(
    //   'Frame time:',
    //   deltaTime.toFixed(4),
    //   this.ticker.elapsedMS,
    //   this.ticker.deltaMS,
    //   this.ticker.deltaTime
    // );
    // Frame time: 0.9993 16.654999999998836 16.654999999998836 0.9992999999999301

    const targetPivot = this.entities.mainPlayer.sprite.position;

    this.camera.pivot.x = targetPivot.x - this.camera.pivot.x + this.camera.pivot.x;
    this.camera.pivot.y = targetPivot.y - this.camera.pivot.y + this.camera.pivot.y;

    /**
     * Test how long you travel/how many steps occur in a certain amount of time
     */

    if (Date.now() >= this.startTime + 10000) {
      this.ticker.stop();
      console.log('Num steps taken:', this.engine.numSteps);
      const pos = this.entities.mainPlayer.body.GetPosition();
      console.log('Player position:', pos.x, pos.y);
      return;
    }

    /**
     * Test how long it takes/how many steps to reach a certain position
     */

    // // console.log(this.entities.mainPlayer.body.GetPosition().x);
    // if (this.entities.mainPlayer.body.GetPosition().x > 50) {
    //   const endTime = Date.now();
    //   this.ticker.stop();
    //   console.log('elapsed time:', endTime - this.startTime);
    //   console.log('num steps taken:', this.engine.numSteps);
    //   return;
    // }

    // this.TEST_processInput();
    // this.DEBUG_processInput();
    // this.processInput();
    this.engine.fixedFixedStep(this.ticker.elapsedMS / 1000);
    // this.engine.fixedStep(this.ticker.elapsedMS / 1000);
  };

  private TEST_processInput() {
    const input: InputData = {
      horizontal: Movement.Right,
      vertical: -1,
      seqNumber: 0,
    };
    // console.log('input:', input);
    this.entities.DEBUG_processInput(input);
  }

  private DEBUG_processInput() {
    const input: InputData = {
      horizontal: this.keyboard.isMovementKeyDown('horizontal'),
      vertical: this.keyboard.isMovementKeyDown('vertical'),
      seqNumber: 0,
    };
    // console.log('input:', input);
    this.entities.DEBUG_processInput(input);
  }

  private processInput() {
    const input: Pick<InputData, 'horizontal' | 'vertical'> = {
      horizontal: this.keyboard.isMovementKeyDown('horizontal'),
      vertical: this.keyboard.isMovementKeyDown('vertical'),
    };

    // Only emit if horizontal or vertical axes have been assigned values
    if (input.horizontal < 0 && input.vertical < 0) {
      return;
    }
    this.entities.enqueueInput(input);
  }
}
