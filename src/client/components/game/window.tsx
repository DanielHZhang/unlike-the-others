/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useEffect, useRef} from 'react';
import {useRecoilValue} from 'recoil';
import {atoms} from 'src/client/store';
import {useDidMount} from 'src/client/hooks';
import {debounce} from 'src/client/utils';
import {Game} from 'src/client/game';

export const GameWindow = (): JSX.Element => {
  const gameRef = useRef<Game | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keybindings = useRecoilValue(atoms.game.keybindings);

  useDidMount(() => {
    if (!canvasRef.current) {
      throw new Error('Canvas ref was not initialized.');
    }

    const app = new Game({view: canvasRef.current, keybindings, debug: true});
    gameRef.current = app;

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

  // Update keybindings via effect from atom
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.updateKeybindings(keybindings);
    }
  }, [keybindings]);

  return <canvas ref={canvasRef} css={{position: 'absolute', display: 'block'}} />;
};
