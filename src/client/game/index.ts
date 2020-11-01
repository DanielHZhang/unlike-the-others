import * as PIXI from 'pixi.js';
import {NetworkInputManager} from 'src/client/game/input';
import {KeyboardManager} from 'src/client/game/keyboard';
import {PhysicsEngine} from 'src/shared/physics-engine';
import {Keybindings} from 'src/shared/types';

export class Game extends PIXI.Application {
  private engine: PhysicsEngine;
  private keyboard: KeyboardManager;
  private network: NetworkInputManager;

  public constructor(view: HTMLCanvasElement, keybindings: Keybindings) {
    super({
      antialias: true,
      resolution: 1,
      view,
    });
    this.engine = new PhysicsEngine();
    this.keyboard = new KeyboardManager(keybindings);
    this.network = new NetworkInputManager();

    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.ticker.add(this.update.bind(this));

    const lobby = new PIXI.Container();
    this.stage.addChild(lobby);

    const main = new PIXI.Container();
    main.visible = false;
    this.stage.addChild(main);

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
    this.network.reset();
    this.network.setMovement(this.keyboard.isMovementKeyDown('horizontal'));
    this.network.setMovement(this.keyboard.isMovementKeyDown('vertical'));
    this.network.emit();
  }
}
