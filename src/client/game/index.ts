import * as PIXI from 'pixi.js';
import {Line} from 'src/client/game/debug';
import {EntityManager} from 'src/client/game/entities';
import {KeyboardManager} from 'src/client/game/keyboard';
import {connection} from 'src/client/network';
import {snapshotModel} from 'src/shared/buffer-schema';
import {PhysicsEngine} from 'src/shared/physics-engine';
import {InputData, Keybindings} from 'src/shared/types';

export class Game extends PIXI.Application {
  private engine: PhysicsEngine;
  private keyboard: KeyboardManager;
  private entities: EntityManager;

  public constructor(view: HTMLCanvasElement, keybindings: Keybindings) {
    super({
      antialias: true,
      resolution: 1,
      view,
    });
    this.engine = new PhysicsEngine();
    this.entities = new EntityManager(this.engine, this.stage);
    this.keyboard = new KeyboardManager(keybindings);

    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.ticker.add(this.update);

    const lobby = new PIXI.Container();
    this.stage.addChild(lobby);

    const main = new PIXI.Container();
    main.visible = false;
    this.stage.addChild(main);

    if (connection.isOpen()) {
      connection.onRaw(this.entities.receiveNetwork);
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

    const line = new Line([200, 150, 0, 0], undefined, 0xffffff);
    this.stage.addChild(line);
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
    console.log('Keydown:', event.key);
    this.keyboard.processKeyDown(event.code, event.key);
    // event.preventDefault();
  };

  /**
   * Keyup event handler.
   */
  public keyup = (event: KeyboardEvent): void => {
    console.log('Keyup:', event.key);
    this.keyboard.processKeyUp(event.code, event.key);
    // event.preventDefault();
  };

  /**
   * Update function of the game loop.
   * @param deltaTime The completion time in ms since the last frame was rendered.
   */
  private update = (deltaTime: number): void => {
    this.DEBUG_processInput();
    // this.processInput();
    this.engine.fixedStep(deltaTime);
  };

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
