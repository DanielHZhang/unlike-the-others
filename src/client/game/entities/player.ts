import Box2D from '@plane2d/core';
// import * as PIXI from 'pixi.js';
import {Rectangle} from 'src/client/game/debug';
import {DynamicEntity} from 'src/client/game/entities/base';
import {Movement, MOVEMENT_MAGNITUDE, WORLD_SCALE} from 'src/shared/constants';
import {InputData} from 'src/shared/types';

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

  public applyLinearImpulse(input: InputData): void {
    const vector = {x: 0, y: 0};
    if (input.horizontal === Movement.Right) {
      vector.x = MOVEMENT_MAGNITUDE;
    }
    if (input.horizontal === Movement.Left) {
      vector.x = -MOVEMENT_MAGNITUDE;
    }
    if (input.vertical === Movement.Down) {
      vector.y = MOVEMENT_MAGNITUDE;
    }
    if (input.vertical === Movement.Up) {
      vector.y = -MOVEMENT_MAGNITUDE;
    }
    this.body.SetLinearVelocity(vector);
  }
}
