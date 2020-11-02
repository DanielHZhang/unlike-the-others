import Box2d from '@supersede/box2d';
import * as PIXI from 'pixi.js';
import {Rectangle} from 'src/client/game/debug';
import {WORLD_SCALE} from 'src/shared/constants';

export class DynamicEntity extends PIXI.Sprite {
  public body: Box2d.b2Body;
  protected prevX: number = 0;
  protected prevY: number = 0;

  public constructor(body: Box2d.b2Body) {
    super();

    // const what = new PIXI.RenderTexture()
    this.body = body;
    this.body.SetUserData(this);
  }

  public getScenePosition(): {sceneX: number; sceneY: number} {
    const {x, y} = this.body.GetPosition();
    return {
      sceneX: x * WORLD_SCALE,
      sceneY: y * WORLD_SCALE,
    };
  }

  public setPrevPosition(x: number, y: number): void {
    this.prevX = x;
    this.prevY = y;
  }

  public lerp(accumulatorRatio: number): void {
    const {sceneX, sceneY} = this.getScenePosition();
    const complement = 1 - accumulatorRatio;
    this.x = accumulatorRatio * sceneX + complement * this.prevX;
    this.y = accumulatorRatio * sceneY + complement * this.prevY;
  }
}
