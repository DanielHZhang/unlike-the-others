import Box2D from '@plane2d/core';
// import * as PIXI from 'pixi.js';
import {Rectangle} from 'src/client/game/debug';
import {DynamicEntity} from 'src/client/game/entities/base';
import {WORLD_SCALE} from 'src/shared/constants';

export class PlayerEntity extends DynamicEntity {
  // public body: Box2d.b2Body;
  // public sprite: Rectangle;

  public constructor(body: Box2D.b2Body) {
    super(body);
    this.anchor.set(0.5);
  }

  public setBodyPosition(x: number, y: number): void {
    this.body.SetPosition({x: x / WORLD_SCALE, y: y / WORLD_SCALE});
  }
}
