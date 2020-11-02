import * as PIXI from 'pixi.js';

export class Rectangle extends PIXI.Graphics {
  public previous: {x: number; y: number} = {x: 0, y: 0};

  public constructor(x: number, y: number, width: number, height: number, color = 0x66ccff) {
    super();
    this.beginFill(color);
    this.lineStyle(4, 0xff3300, 1);
    this.drawRect(x, y, width, height);
    this.endFill();
  }

  public setPrevious(x: number, y: number): void {
    this.previous.x = x;
    this.previous.y = y;
  }
}
