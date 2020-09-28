import React, {memo, useState} from 'react';
import styled from '@emotion/styled';
import {tsParticles} from 'tsparticles';
import {Container} from 'tsparticles/dist/Core/Container';
import type {RecursivePartial} from 'tsparticles/dist/Types/RecursivePartial';
import type {IOptions} from 'tsparticles/dist/Interfaces/Options/IOptions';
import {useDidMount} from 'src/client/utils/hooks';

const particleOptions: RecursivePartial<IOptions> = {
  // backgroundMask: {
  //   cover: {
  //     color: {
  //       value: '#fff',
  //     },
  //     opacity: 1,
  //   },
  //   enable: false,
  // },
  detectRetina: true,
  fpsLimit: 60,
  interactivity: {
    detectsOn: 'window',
    events: {
      onHover: {
        enable: true,
        mode: 'attract',
        parallax: {
          enable: true,
          force: 60,
          smooth: 10,
        },
      },
      resize: true,
    },
    modes: {
      attract: {
        distance: 400,
        duration: 0.5,
        speed: 1,
      },
    },
  },
  particles: {
    color: {
      value: '#ffffff',
      animation: {
        enable: false,
        speed: 0.5,
        sync: true,
      },
    },
    move: {
      angle: 90,
      attract: {
        enable: false,
        rotate: {
          x: 600,
          y: 600,
        },
      },
      direction: 'none',
      enable: true,
      noise: {
        delay: {
          random: {
            enable: false,
            minimumValue: 0,
          },
          value: 0,
        },
        enable: false,
      },
      outMode: 'out',
      random: true,
      speed: 1,
      straight: false,
      trail: {
        enable: false,
        length: 10,
        fillColor: {
          value: '#000000',
        },
      },
      vibrate: false,
      warp: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
        factor: 1000,
      },
      limit: 0,
      value: 160,
    },
    opacity: {
      animation: {
        enable: true,
        minimumValue: 0,
        speed: 1,
        sync: false,
      },
      random: {
        enable: true,
        minimumValue: 1,
      },
      value: 1,
    },
    rotate: {
      animation: {
        enable: false,
        speed: 0,
        sync: false,
      },
      direction: 'clockwise',
      path: false,
      random: false,
      value: 0,
    },
    shape: {
      type: 'circle',
    },
    size: {
      animation: {
        destroy: 'none',
        enable: false,
        minimumValue: 0.3,
        speed: 4,
        startValue: 'max',
        sync: false,
      },
      random: {
        enable: true,
        minimumValue: 1,
      },
      value: 3,
    },
  },
  pauseOnBlur: true,
};

const buildParticlesLibrary = () => {
  tsParticles.init();
  const container = new Container('particles', particleOptions);
  return container;
};

const Wrapper = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: -1;
`;

export const BackgroundParticles = memo(
  () => {
    const [state, setState] = useState<{container?: Container}>({container: undefined});
    const destroy = () => {
      state.container?.destroy();
      setState({...state, container: undefined});
    };
    const setCanvas = (canvas: HTMLCanvasElement) => {
      if (!canvas) {
        return;
      }
      const {container} = state;
      if (!container) {
        return;
      }
      container.canvas.loadCanvas(canvas);
      container.start().catch(console.error);
    };

    useDidMount(() => {
      setState({container: buildParticlesLibrary()});
      return destroy;
    });

    return (
      <Wrapper>
        <canvas ref={setCanvas} style={{width: '100%', height: '100%'}} />
      </Wrapper>
    );
  },
  () => true
);
