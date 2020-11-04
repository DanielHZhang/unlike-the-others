import {XY} from '@plane2d/core';
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
  protected readonly initialScreenSize: XY;
  protected readonly debug: boolean;
  protected readonly startTime: number;
  protected engine: PhysicsEngine;
  protected keyboard: KeyboardManager;
  protected camera: PIXI.Container;
  protected scene: PIXI.Container;
  protected minimap: PIXI.Sprite;
  protected background: PIXI.Sprite;
  protected minimapTexture: PIXI.RenderTexture;
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
    this.debug = options.debug ?? false;
    this.initialScreenSize = {x: window.innerWidth, y: window.innerHeight};
    this.engine = new PhysicsEngine(this.processInput);
    this.keyboard = new KeyboardManager(options.keybindings);

    // this.renderer.resize(window.innerWidth, window.innerHeight);
    // console.log('original size:', this.renderer.screen.width, this.renderer.screen.height);
    // console.log('original size:', window.innerWidth, window.innerHeight);
    this.ticker.add(this.update, this);
    // this.ticker.maxFPS = 15;
    this.startTime = Date.now();

    this.camera = new PIXI.Container();
    this.camera.position.set(this.renderer.screen.width / 2, this.renderer.screen.height / 2);
    // camera.pivot.copyFrom();

    this.player = new PlayerEntity(this.engine.createPlayerBody());
    this.player.setBodyPosition(0, 0);
    console.log(this.player.position);

    this.scene = new PIXI.Container();

    const minimapTexture = PIXI.RenderTexture.create({width: 300, height: 300});
    this.minimapTexture = minimapTexture;

    const map = new PIXI.Sprite(minimapTexture);
    map.position.x = this.renderer.screen.width - 316;
    map.position.y = 16;
    // map.scale.x = 0.5;
    // map.scale.y = 0.5;
    // map.anchor.copyFrom({x: 0.5, y: 0.5});
    // this.scene.addChild(map);
    // this.stage.addChild(map);

    // Add direct children to main stage
    this.stage.addChild(this.camera);
    this.stage.addChild(this.scene);
    this.minimap = map;
    this.background = new PIXI.Sprite();

    // this.background.anchor.copyFrom({x: 0.5, y: 0.5});
    // // MASK (clip things outside the background border)
    // const mask = new PIXI.Graphics();
    // mask.beginFill(0xffffff);
    // mask.drawRect(0, 0, 1000, 1000);
    // mask.endFill();
    // this.stage.addChild(mask);
    // this.stage.mask = mask;

    // this.minimap = new PIXI.Rectangle(
    //   this.camera.pivot.x - this.renderer.screen.width / 2,
    //   this.camera.pivot.x - this.renderer.screen.height / 2,
    //   this.renderer.screen.width,
    //   this.renderer.screen.height
    // );
    // this.minimap.pad(400, 400);

    // const lobby = new PIXI.Container();
    // this.stage.addChild(lobby);

    // const main = new PIXI.Container();
    // main.visible = false;
    // this.stage.addChild(main);

    if (connection.isOpen()) {
      connection.onRaw(this.receiveNetwork);
    }

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
    this.background.texture = this.loader.resources.floorplan.texture;
    this.player.texture = this.loader.resources.player.texture;
    this.player.scale.set(0.4, 0.4);
    // this.scene.addChild(background);
    this.camera.addChild(this.background);
    this.camera.addChild(this.player);
  }

  // public dispose(): void {
  //   const options = {children: true, texture: true, baseTexture: true};
  //   this.stage.destroy(options);
  //   // this.background.destroy(options);
  //   this.player.destroy(options);
  //   // this.camera.destroy(options);
  // }

  public enqueueInput(input: Partial<InputData>): void {
    // DEBUG:
    this.player.applyLinearImpulse(input as InputData);
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
  public resizeCameraView(): void {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    this.renderer.resize(screenWidth, screenHeight);
    this.camera.position.set(screenWidth / 2, screenHeight / 2);
  }

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
    // console.log(this.player.position.x, this.player.body.GetPosition().x);
    // this.camera.scale.x = this.camera.scale.y = 0.15;
    this.renderer.render(this.scene, this.minimapTexture);
    // this.camera.scale.x = this.camera.scale.y = 1;
    // console.log(this.camera.x);

    // Follow player position with camera
    this.camera.pivot.copyFrom(this.player.position);
    // console.log(
    //   'Player position:',
    //   this.player.position.x.toFixed(4),
    //   this.player.position.y.toFixed(4)
    // );
    // if (this.player.position.x < this.player.prevX) {
    //   console.log(
    //     'SHOULD BE MONOTONICALLY INCREASING, but got:',
    //     this.player.position.x,
    //     this.player.prevX
    //   );
    // }
    // this.camera.pivot.x = this.player.position.x; /* - this.camera.pivot.x + this.camera.pivot.x; */
    // this.camera.pivot.y = this.player.position.y; /* - this.camera.pivot.y + this.camera.pivot.y; */

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
