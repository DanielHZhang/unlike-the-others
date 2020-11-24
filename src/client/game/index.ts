import * as PIXI from 'pixi.js';
import {Ease} from 'src/client/game/ease';
import {KeyboardManager} from 'src/client/game/keyboard';
import {PlayerEntity} from 'src/client/game/entities/player';
import {PhysicsEngine, inputModel, snapshotModel} from 'src/shared/game';
import {Movement} from 'src/shared/constants';
import type {ClientSocket} from 'src/client/network';
import type {SnapshotData, InputData, Keybindings} from 'src/shared/types';

type GameOptions = {
  view: HTMLCanvasElement;
  keybindings: Keybindings;
  debug?: boolean;
  socket: ClientSocket;
};

export class Game extends PIXI.Application {
  protected readonly debug: boolean;
  protected readonly startTime: number;
  protected readonly socket: ClientSocket;
  protected readonly engine: PhysicsEngine;
  protected readonly keyboard: KeyboardManager;
  protected camera: PIXI.Container;
  protected scene: PIXI.Container;
  protected transition: PIXI.Container;
  protected background: PIXI.Sprite;
  protected mask: PIXI.Graphics;
  protected player: PlayerEntity;
  protected otherPlayers: PlayerEntity[] = [];
  protected pendingInputs: InputData[] = [];
  protected sequenceNumber = 0;

  public constructor(options: GameOptions) {
    super({
      antialias: true,
      resolution: 1,
      width: window.innerWidth,
      height: window.innerHeight,
      transparent: true,
      view: options.view,
    });
    // Assign instance variables
    this.debug = options.debug ?? false;
    this.engine = new PhysicsEngine(this.processInput);
    this.keyboard = new KeyboardManager(options.keybindings);
    this.socket = options.socket;
    this.startTime = Date.now();

    // Configure ticker
    this.ticker.autoStart = false;
    this.ticker.add(this.update, this);
    this.ticker.stop();
    // this.ticker.maxFPS = 15;

    const {width: screenWidth, height: screenHeight} = this.renderer.screen;
    const largerDimension = screenWidth > screenHeight ? screenWidth : screenHeight;

    // Configure camera scene
    this.camera = new PIXI.Container();
    this.camera.position.set(screenWidth / 2, screenHeight / 2);

    // Configure main player entity
    this.player = new PlayerEntity(this.engine.createPlayerBody());
    this.player.setBodyPosition(0, 0);

    // Configure main scene
    this.scene = new PIXI.Container();
    this.transition = new PIXI.Container();

    // Mask for transition
    this.mask = new PIXI.Graphics();
    this.mask.beginFill(0x111111);
    this.mask.lineStyle(0);
    this.mask.drawCircle(0, 0, largerDimension);
    this.mask.endFill();
    this.mask.scale.set(0.01);
    this.camera.mask = this.mask;

    // Add direct children to main stage
    this.stage.addChild(this.camera);

    // Temp, clean up later
    this.background = new PIXI.Sprite();
    this.background.anchor.set(0.5, 0.5);
    this.camera.addChild(this.mask);
    // this.stage.addChild(mask);
    // this.stage.addChild(new Rectangle(0, 0, 200, 200));

    // this.background.anchor.copyFrom({x: 0.5, y: 0.5});
    // // MASK (clip things outside the background border)
    // const mask = new PIXI.Graphics();
    // mask.beginFill(0xffffff);
    // mask.drawRect(0, 0, 1000, 1000);
    // mask.endFill();
    // this.stage.addChild(mask);
    // this.stage.mask = mask;
  }

  public async loadAssets(): Promise<void> {
    // await socket should be in good state here;
    await new Promise((resolve, reject) => {
      this.loader.add([
        {name: 'floorplan', url: '/assets/floorplan.jpg'},
        {name: 'player', url: '/assets/box.png'},
      ]);
      this.loader.load(resolve);
      this.loader.onError.once(reject);
    });

    this.background.texture = this.loader.resources.floorplan.texture;
    this.player.texture = this.loader.resources.player.texture;
    this.player.scale.set(0.4, 0.4);
    this.camera.addChild(this.background, this.player);
    this.ticker.start();
  }

  // public dispose(): void {
  //   const options = {children: true, texture: true, baseTexture: true};
  //   this.stage.destroy(options);
  //   // this.background.destroy(options);
  //   this.player.destroy(options);
  //   // this.camera.destroy(options);
  // }

  public receiveNetwork(data: ArrayBuffer): void {
    const snapshot = snapshotModel.fromBuffer(data) as SnapshotData;
    // console.log('Data from update:', snapshot);

    let i = 0;

    // Set authoritative position received by the server
    const playerPosition = snapshot.players[0];
    this.player.body.SetPositionXY(playerPosition.x, playerPosition.y);

    // Remove all inputs that have already been processed by the server
    while (i < this.pendingInputs.length) {
      const input = this.pendingInputs[i];
      if (input.sequenceNumber <= snapshot.sequenceNumber) {
        this.pendingInputs.splice(i, 1); // Remove input from array
      } else {
        // Re-apply input to player
        this.player.applyLinearImpulse(input);
        i++;
      }
    }
  }

  /**
   * Update keyboard bindings for player controls.
   */
  public updateKeybindings(newBindings: Keybindings): void {
    this.keyboard.setBindings(newBindings);
  }

  /**
   * Resize the renderer and set the camera based on the current window size.
   */
  public resizeCameraView = (): void => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    this.renderer.resize(screenWidth, screenHeight);
    this.camera.position.set(screenWidth / 2, screenHeight / 2);
  };

  /**
   * Window blur event handler.
   */
  public blur = (): void => {
    this.keyboard.reset();
  };

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
  protected update(deltaTime: number): void {
    // Follow player position with camera
    this.camera.pivot.copyFrom(this.player.position);

    if (this.mask.visible) {
      if (this.mask.scale.x <= 1) {
        this.mask.scale.set(this.mask.scale.x + 0.05 * Ease.out(this.mask.scale.x, 2) * deltaTime);
      } else {
        this.camera.mask = null;
        this.mask.visible = false;
        this.camera.removeChild(this.mask);
      }
    }

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
  }

  private processInput = () => {
    const input: InputData = {
      sequenceNumber: this.sequenceNumber,
      horizontal: this.keyboard.isMovementKeyDown('horizontal'),
      vertical: this.keyboard.isMovementKeyDown('vertical'),
    };

    // Only emit if horizontal or vertical axes have been assigned values
    if (input.horizontal === Movement.None && input.vertical === Movement.None) {
      return;
    }

    input.sequenceNumber = this.sequenceNumber++;

    // DEBUG:
    this.player.applyLinearImpulse(input);
    // return;

    this.pendingInputs.push(input);

    const serialized = inputModel.toBuffer(input);
    console.log('Input:', input);
    console.log('from buffer:', inputModel.fromBuffer(serialized));
    this.socket.emitRaw(serialized);
  };

  // private enqueueInput(input: InputData): void {
  // }
}
