import * as PIXI from 'pixi.js';
import {PhysicsEngine} from 'src/shared/physics-engine';

export class Game extends PIXI.Application {
  private engine: PhysicsEngine;

  public constructor(view: HTMLCanvasElement) {
    super({
      antialias: true,
      resolution: 1,
      view,
    });
    this.engine = new PhysicsEngine();

    this.renderer.resize(window.innerWidth, window.innerHeight);
    this.ticker.add(this.update);

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
   * Keydown event handler.
   */
  public keydown(event: KeyboardEvent): void {
    //
  }

  /**
   * Keyup event handler.
   */
  public keyup(event: KeyboardEvent): void {
    //
  }

  /**
   * Update function of the game loop.
   * @param deltaTime The completion time in ms since the last frame was rendered.
   */
  private update(deltaTime: number): void {
    // all the update code here
    this.engine.fixedStep(deltaTime);
  }
}
