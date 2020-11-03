import * as PIXI from 'pixi.js';
import Box2D from '@plane2d/core';
import {WORLD_SCALE} from 'src/shared/constants';

export class DynamicEntity extends PIXI.Sprite {
  public body: Box2D.b2Body;
  public prevX: number = 0;
  public prevY: number = 0;

  public constructor(body: Box2D.b2Body) {
    super();
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
