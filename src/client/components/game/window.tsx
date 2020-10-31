/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useRef} from 'react';
import {useRecoilValue} from 'recoil';
import {atoms} from 'src/client/store';
import {useDidMount} from 'src/client/hooks';
import {debounce} from 'src/client/utils';
import {Game} from 'src/client/game';

export const GameWindow = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameControls = useRecoilValue(atoms.gameControls);

  useDidMount(() => {
    if (!canvasRef.current) {
      throw new Error('Canvas ref was not initialized.');
    }

    const app = new Game(canvasRef.current);

    // Add keyboard listeners
    document.addEventListener('keydown', app.keydown);
    document.addEventListener('keyup', app.keyup);

    // Prevent showing context menu with all mouse buttons other than left click
    const contextMenuListener = (event: MouseEvent) => {
      event.preventDefault();
    };
    document.addEventListener('contextmenu', contextMenuListener);

    // Add window resize listener
    const windowResizeListener = debounce(() => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    }, 300);
    window.addEventListener('resize', windowResizeListener);

    // Tear down listeners and end the game
    return () => {
      document.removeEventListener('keydown', app.keydown);
      document.removeEventListener('keyup', app.keyup);
      document.removeEventListener('contextmenu', contextMenuListener);
      window.removeEventListener('resize', windowResizeListener);
    };
  });
  return <canvas ref={canvasRef} css={{position: 'absolute', display: 'block'}} />;
};
