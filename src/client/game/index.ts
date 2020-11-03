import * as PIXI from 'pixi.js';
import {PlayerEntity} from 'src/client/game/entities/player';
import {KeyboardManager} from 'src/client/game/keyboard';
import {connection} from 'src/client/network';
import {snapshotModel} from 'src/shared/buffer-schema';
import {Movement, WORLD_SCALE} from 'src/shared/constants';
import {PhysicsEngine} from 'src/shared/physics-engine';
import {BufferSnapshotData, InputData, Keybindings} from 'src/shared/types';

type GameOptions = {
  view: HTMLCanvasElement;
  keybindings: Keybindings;
  debug?: boolean;
};

export class Game extends PIXI.Application {
  protected readonly debug: boolean;
  protected readonly startTime: number;
  protected engine: PhysicsEngine;
  protected keyboard: KeyboardManager;
  protected camera: PIXI.Container;
  protected player: PlayerEntity;
  protected otherPlayers: PlayerEntity[] = [];
  protected pendingInputs: InputData[] = [];
  protected sequenceNumber = 0;

  public constructor(options: GameOptions) {
    super({
      antialias: true,
      resolution: 1,
      view: options.view,
    });
    this.debug = options.debug ?? false;

    this.engine = new PhysicsEngine(this.processInput);
    this.keyboard = new KeyboardManager(options.keybindings);

    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.ticker.add(this.update);
    // this.ticker.maxFPS = 15;
    this.startTime = Date.now();

    this.camera = new PIXI.Container();
    this.camera.position.set(this.renderer.screen.width / 2, this.renderer.screen.height / 2);
    // camera.pivot.copyFrom();
    this.stage.addChild(this.camera);

    this.player = new PlayerEntity(this.engine.createPlayerBody());
    // this.entities = new EntityManager(this.engine, this.camera);

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
    this.loadAssets();
  }

  public async loadAssets(): Promise<void> {
    await new Promise((resolve, reject) => {
      this.loader.add([
        {name: 'floorplan', url: '/assets/floorplan.jpg'},
        {name: 'player', url: '/assets/box.png'},
      ]);
      this.loader.load(resolve);
      this.loader.onError.once(reject);
    });

    const background = new PIXI.Sprite(this.loader.resources.floorplan.texture);
    this.player.texture = this.loader.resources.player.texture;
    this.player.scale.set(0.5, 0.5);
    this.camera.addChild(background);
    this.camera.addChild(this.player);
  }

  public enqueueInput(input: Partial<InputData>): void {
    // DEBUG:
    this.applyVelocity(input as InputData);
    return;

    input.sequenceNumber = this.sequenceNumber++;
    this.pendingInputs.push(input as InputData);
  }

  public emit(): void {
    // const inputData: BufferInputData = {
    //   s: this.currentInput.seqNumber,
    //   h: this.currentInput.horizontal,
    //   v: this.currentInput.vertical,
    // };
    // connection.emitRaw(inputModel.toBuffer(inputData));
  }

  public receiveNetwork(data: ArrayBuffer): void {
    const snapshot = snapshotModel.fromBuffer(data) as BufferSnapshotData;
    // console.log('Data from update:', snapshot);

    let i = 0;

    // Set authoritative position received by the server
    const playerPosition = snapshot.players[0];
    this.player.body.SetPositionXY(playerPosition.x, playerPosition.y);

    // Remove all inputs that have already been processed by the server
    while (i < this.pendingInputs.length) {
      const input = this.pendingInputs[i];
      if (input.sequenceNumber <= snapshot.seq) {
        this.pendingInputs.splice(i, 1); // Remove input from array
      } else {
        this.applyVelocity(input);
        i++;
      }
    }
  }

  private applyVelocity(input: InputData) {
    // Re-apply input to player
    const vector = {x: 0, y: 0};
    const movementUnit = 90 / WORLD_SCALE;
    if (input.horizontal === Movement.Right) {
      vector.x = movementUnit;
    } else if (input.horizontal === Movement.Left) {
      vector.x = -movementUnit;
    }
    if (input.vertical === Movement.Down) {
      vector.y = movementUnit;
    } else if (input.vertical === Movement.Up) {
      vector.y = -movementUnit;
    }
    this.player.body.SetLinearVelocity(vector);
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

  /**
   * Update function of the game loop.
   * @param deltaTime `ticker.deltaTime` Scalar time value from last frame to this frame.
   */
  protected update = (deltaTime: number): void => {
    // Follow player position with camera
    const targetPivot = this.player.position;
    this.camera.pivot.x = targetPivot.x; /* - this.camera.pivot.x + this.camera.pivot.x; */
    this.camera.pivot.y = targetPivot.y; /* - this.camera.pivot.y + this.camera.pivot.y; */

    // console.log(
    //   'Frame time:',
    //   deltaTime.toFixed(4),
    //   this.ticker.elapsedMS,
    //   this.ticker.deltaMS,
    //   this.ticker.deltaTime
    // );
    // Frame time: 0.9993 16.654999999998836 16.654999999998836 0.9992999999999301

    if (this.debug) {
      if (Date.now() >= this.startTime + 10000) {
        this.ticker.stop();
        console.log('# steps taken:', this.engine.currentStep);
        const pos = this.player.body.GetPosition();
        console.log('Player position:', pos.x, ',', pos.y);
        return;
      }
    }

    this.engine.fixedStep(this.ticker.elapsedMS);
  };

  private processInput = () => {
    const input: Pick<InputData, 'horizontal' | 'vertical'> = {
      horizontal: this.keyboard.isMovementKeyDown('horizontal'),
      vertical: this.keyboard.isMovementKeyDown('vertical'),
    };

    // Only emit if horizontal or vertical axes have been assigned values
    if (input.horizontal < 0 && input.vertical < 0) {
      return;
    }
    this.enqueueInput(input);
  };
}
