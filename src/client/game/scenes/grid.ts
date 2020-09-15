import Phaser from 'phaser';

export class AlignGrid {
  public graphics: Phaser.GameObjects.Graphics;
  public scene: Phaser.Scene;
  public width: number;
  public height: number;
  public cols: number;
  public rows: number;
  public cw: number;
  public ch: number;

  constructor(scene: Phaser.Scene, width: number, height: number, rows: number, cols: number) {
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.rows = rows;
    this.cols = cols;
    // cw cell width is the scene width divided by the number of columns
    this.cw = this.width / this.cols;
    // ch cell height is the scene height divided the number of rows
    this.ch = this.height / this.rows;
  }

  show(a = 1) {
    this.graphics = this.scene.add.graphics();
    this.graphics.lineStyle(4, 0xff0000, a);

    for (let i = 0; i < this.width; i += this.cw) {
      this.graphics.moveTo(i, 0);
      this.graphics.lineTo(i, this.height);
    }
    for (let i = 0; i < this.height; i += this.ch) {
      this.graphics.moveTo(0, i);
      this.graphics.lineTo(this.width, i);
    }
    this.graphics.strokePath();
  }
}
