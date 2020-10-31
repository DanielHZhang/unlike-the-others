/** @jsx jsx */
import * as PIXI from 'pixi.js';
import {jsx} from '@emotion/react';
import {useRef} from 'react';
import {useRecoilValue} from 'recoil';
import {atoms} from 'src/client/store';
import {useDidMount} from 'src/client/hooks';
import {debounce} from 'src/client/utils';

class Line extends PIXI.Graphics {
  public points: number[];
  public width: number;
  public color: number;

  public constructor(points: number[], width: number = 5, color: number = 0x000000) {
    super();
    this.points = points;
    this.width = width;
    this.color = color;
  }

  public draw() {
    this.lineStyle(this.width, this.color);
    this.moveTo(this.points[0], this.points[1]);
    this.lineTo(this.points[2], this.points[3]);
  }

  public updatePoints(p: number[]) {
    this.points = p.map((val, index) => val ?? this.points[index]);
    this.clear();
    this.draw();
  }
}

export const GameWindow = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameControls = useRecoilValue(atoms.gameControls);

  // console.log(PIXI.utils.isWebGLSupported());

  useDidMount(() => {
    if (!canvasRef.current) {
      throw new Error('Canvas ref was not initialized.');
    }
    const app = new PIXI.Application({
      antialias: true,
      width: 1000,
      height: 800,
      view: canvasRef.current,
    });

    app.renderer.resize(window.innerWidth, window.innerHeight);

    // Add window resize listener
    const windowResizeListener = debounce(() => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    }, 300);
    window.addEventListener('resize', windowResizeListener);

    const renderer = PIXI.autoDetectRenderer();

    // const stage = new Pixi.Stage();
    // stage.loader.add();

    // const line = new Line([200, 150, 0, 0]);
    return () => {
      window.removeEventListener('resize', windowResizeListener);
    };
  });
  return <canvas ref={canvasRef} css={{position: 'absolute', display: 'block'}} />;
  // return <div id={elementId} />;
};
