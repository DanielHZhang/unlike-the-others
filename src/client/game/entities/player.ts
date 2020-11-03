import Box2D from '@plane2d/core';
// import * as PIXI from 'pixi.js';
import {Rectangle} from 'src/client/game/debug';
import {DynamicEntity} from 'src/client/game/entities/base';

export class PlayerEntity extends DynamicEntity {
  // public body: Box2d.b2Body;
  // public sprite: Rectangle;

  public constructor(body: Box2D.b2Body) {
    super(body);
    // this.body = body;

    // this.sprite = new Rectangle(0, 0, 100, 100);
  }
}
