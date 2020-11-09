/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useEffect, useRef, useState} from 'react';
import {AnimatePresence} from 'framer-motion';
import {useRecoilValue} from 'recoil';
import {useLocation} from 'wouter';
import {asyncAtoms, atoms} from 'src/client/store';
import {useAsyncAtomLoadable, useWebsocket} from 'src/client/hooks';
import {debounce} from 'src/client/utils';
import {Game} from 'src/client/game';
import {Flex} from 'src/client/components/base';
import {GameLoading, GameError} from 'src/client/components/game';

export const GamePage = (): JSX.Element => {
  const gameRef = useRef<Game | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keybindings = useRecoilValue(atoms.game.keybindings);
  const [, setLocation] = useLocation();
  const [errorMessage, setErrorMessage] = useState('');
  const [mounted, setMounted] = useState(false);
  const [user] = useAsyncAtomLoadable(asyncAtoms.user);
  const {socket} = useWebsocket('game');

  useEffect(() => {
    // Do not run the effect unless the access token is defined and the connection
    // has not yet been initiated.
    if (user.state === 'loading' || mounted || socket.isOpen()) {
      return;
    }
    if (user.state === 'hasError' || !user.contents.isAuthed || !user.contents.accessToken) {
      return setLocation('/');
    }
    if (!canvasRef.current) {
      throw new Error('Canvas DOM ref was not initialized.');
    }

    const app = new Game({view: canvasRef.current, keybindings, debug: false, socket});
    gameRef.current = app;

    (async () => {
      try {
        await socket.connect(`ws?token=${user.contents.accessToken}`);
        await app.loadAssets();
        socket.on('state', app.receiveNetwork);
        setMounted(true);
      } catch (error) {
        console.error('Error occurred:', error);
        setErrorMessage(typeof error === 'string' ? error : 'Something went wrong.');
      }
    })();

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
      socket.dispose();
    };
  }, [user.state]);

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
        css={{position: 'absolute', display: mounted ? 'block' : 'none', zIndex: 1}}
      />
      {errorMessage && <GameError message={errorMessage} />}
      <AnimatePresence>{!mounted && <GameLoading />}</AnimatePresence>
    </Flex>
  );
};
