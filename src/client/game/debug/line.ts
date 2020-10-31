import * as PIXI from 'pixi.js';

export class Line extends PIXI.Graphics {
  public points: number[];
  public width: number;
  public color: number;

  public constructor(points: number[], width: number = 5, color: number = 0x000000) {
    super();
    this.points = points;
    this.width = width;
    this.color = color;
    this.draw();
  }

  public draw(): void {
    this.lineStyle(this.width, this.color);
    this.moveTo(this.points[0], this.points[1]);
    this.lineTo(this.points[2], this.points[3]);
  }

  public updatePoints(p: number[]): void {
    this.points = p.map((val, index) => val ?? this.points[index]);
    this.clear();
    this.draw();
  }
}
