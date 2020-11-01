import * as PIXI from 'pixi.js';
import {KeyboardManager} from 'src/client/game/keyboard';
import {connection} from 'src/client/network';
import {snapshotModel} from 'src/shared/buffer-schema';
import {PhysicsEngine} from 'src/shared/physics-engine';
import {Keybindings} from 'src/shared/types';

type InputData = {
  seqNumber: number;
  horizontal: number;
  vertical: number;
};

export class Game extends PIXI.Application {
  private engine: PhysicsEngine;
  private keyboard: KeyboardManager;
  public pendingInputs: InputData[] = [];
  private currentInput = {
    seqNumber: 1,
    horizontal: -1,
    vertical: -1,
  };

  public constructor(view: HTMLCanvasElement, keybindings: Keybindings) {
    super({
      antialias: true,
      resolution: 1,
      view,
    });
    this.engine = new PhysicsEngine();
    this.keyboard = new KeyboardManager(keybindings);

    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.ticker.add(this.update.bind(this));

    const lobby = new PIXI.Container();
    this.stage.addChild(lobby);

    const main = new PIXI.Container();
    main.visible = false;
    this.stage.addChild(main);

    if (connection.isOpen()) {
      connection.onRaw(this.receiveNetwork);
    }

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
    // app.stage.addChild(line);
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
  public keydown(event: KeyboardEvent): void {
    console.log('Keydown:', event.key);
    this.keyboard.processKeyDown(event.code, event.key);
    event.preventDefault();
  }

  /**
   * Keyup event handler.
   */
  public keyup(event: KeyboardEvent): void {
    console.log('Keyup:', event.key);
    this.keyboard.processKeyUp(event.code, event.key);
    event.preventDefault();
  }

  /**
   * Update function of the game loop.
   * @param deltaTime The completion time in ms since the last frame was rendered.
   */
  private update(deltaTime: number): void {
    this.processInput();
    this.engine.fixedStep(deltaTime);
  }

  private processInput() {
    this.currentInput.horizontal = this.keyboard.isMovementKeyDown('horizontal');
    this.currentInput.vertical = this.keyboard.isMovementKeyDown('vertical');

    // Only emit if horizontal or vertical axes have been assigned values
    if (this.currentInput.horizontal < 0 && this.currentInput.vertical < 0) {
      return;
    }

    this.pendingInputs.push(this.currentInput);

    // const inputData: BufferInputData = {
    //   s: this.currentInput.seqNumber,
    //   h: this.currentInput.horizontal,
    //   v: this.currentInput.vertical,
    // };
    // connection.emitRaw(inputModel.toBuffer(inputData));

    // Reset the current input with incremented seqNumber
    this.currentInput = {
      seqNumber: this.currentInput.seqNumber++,
      horizontal: -1,
      vertical: -1,
    };
  }

  private receiveNetwork(data: ArrayBuffer) {
    const snapshot = snapshotModel.fromBuffer(data);
    // console.log('Data from update:', snapshot);

    let i = 0;

    // Set authoritative position received by the server
    const playerPosition = snapshot.players[0];
    playerBody.SetPositionXY(playerPosition.x, playerPosition.y);

    // Remove all inputs that have already been processed by the server
    while (i < this.pendingInputs.length) {
      const input = this.pendingInputs[i];
      if (input.seqNumber <= snapshot.seq) {
        this.pendingInputs.splice(i, 1); // Remove input from array
      } else {
        // Re-apply input to player
        const vector = new Box2d.b2Vec2();
        const movementUnit = 90 / WORLD_SCALE;
        if (input.horizontal === Movement.Right) {
          vector.Set(movementUnit, 0);
        } else if (input.horizontal === Movement.Left) {
          vector.Set(-movementUnit, 0);
        }
        if (input.v === Movement.Down) {
          vector.y = movementUnit;
        } else if (input.v === Movement.Up) {
          vector.y = -movementUnit;
        }
        playerBody.SetLinearVelocity(vector);
        i++;
      }
    }
  }
}
