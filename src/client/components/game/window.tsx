/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useEffect, useRef, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
import {useRecoilValue} from 'recoil';
import {atoms} from 'src/client/store';
import {useDidMount} from 'src/client/hooks';
import {debounce} from 'src/client/utils';
import {Game} from 'src/client/game';
import {Flex} from 'src/client/components/base';
import {connection} from 'src/client/network';
import {GameLoading} from 'src/client/components/game/loading';

export const GameWindow = (): JSX.Element => {
  const gameRef = useRef<Game | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keybindings = useRecoilValue(atoms.game.keybindings);
  const [loading, setLoading] = useState(true);

  useDidMount(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
    if (!canvasRef.current) {
      throw new Error('Canvas ref was not initialized.');
    }

    const app = new Game({view: canvasRef.current, keybindings, debug: false});
    gameRef.current = app;

    if (connection.isOpen()) {
      connection.on('state', app.receiveNetwork);
      // connection.onRaw(app.receiveNetwork);
    }

    // Keyboard listeners
    document.addEventListener('keydown', app.keydown);
    document.addEventListener('keyup', app.keyup);

    // Prevent showing context menu with all mouse buttons other than left click
    const contextMenuListener = (event: MouseEvent) => {
      event.preventDefault();
    };
    document.addEventListener('contextmenu', contextMenuListener);

    // Window resize listener
    const windowResizeListener = debounce(app.resizeCameraView, 300);
    window.addEventListener('resize', windowResizeListener);

    // Window blur listener
    window.addEventListener('blur', app.blur);

    // Tear down listeners and end the game
    return () => {
      document.removeEventListener('keydown', app.keydown);
      document.removeEventListener('keyup', app.keyup);
      document.removeEventListener('contextmenu', contextMenuListener);
      window.removeEventListener('resize', windowResizeListener);
      window.removeEventListener('blur', app.blur);
      app.destroy(false, {children: true, texture: true, baseTexture: true});
      gameRef.current = null;
    };
  });

  // Update keybindings via effect from atom
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.updateKeybindings(keybindings);
    }
  }, [keybindings]);

  return (
    <Flex crossAxis='stretch' css={{minHeight: '100%', overflow: 'hidden', position: 'relative'}}>
      <canvas
        ref={canvasRef}
        css={{position: 'absolute', display: loading ? 'none' : 'block', zIndex: 1}}
      />
      <AnimatePresence>{loading && <GameLoading />}</AnimatePresence>
    </Flex>
  );
};
