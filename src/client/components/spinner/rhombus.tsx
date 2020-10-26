import React from 'react';
import styled from '@emotion/styled';

type Props = {
  size: number;
  animationDuration: number;
};

const LoadingRhombus = styled.div<Props>`
  width: ${(props) => props.size * 4}px;
  height: ${(props) => props.size}px;
  position: relative;
  * {
    box-sizing: border-box;
  }
  .rhombus {
    height: ${(props) => props.size}px;
    width: ${(props) => props.size}px;
    background-color: ${(props) => props.color};
    left: ${(props) => props.size * 4}px;
    position: absolute;
    margin: 0 auto;
    border-radius: 2px;
    transform: translateY(0) rotate(45deg) scale(0);
    animation: looping-rhombuses-spinner-animation ${(props) => props.animationDuration}ms linear
      infinite;
  }
  .rhombus:nth-of-type(1) {
    animation-delay: calc(${(props) => props.animationDuration}ms * 1 / -1.5);
  }
  .rhombus:nth-of-type(2) {
    animation-delay: calc(${(props) => props.animationDuration}ms * 2 / -1.5);
  }
  .rhombus:nth-of-type(3) {
    animation-delay: calc(${(props) => props.animationDuration}ms * 3 / -1.5);
  }
  @keyframes looping-rhombuses-spinner-animation {
    0% {
      transform: translateX(0) rotate(45deg) scale(0);
    }
    50% {
      transform: translateX(-233%) rotate(45deg) scale(1);
    }
    100% {
      transform: translateX(-466%) rotate(45deg) scale(0);
    }
  }
`;

export const RhombusSpinner = (): JSX.Element => {
  const size = 15;
  const color = '#fff';
  const animationDuration = 2500;

  return (
    <LoadingRhombus
      size={size}
      color={color}
      animationDuration={animationDuration}
      className='looping-rhombuses-spinner'
    >
      {Array.from({length: 3}).map((_, index) => (
        <div key={index} className='rhombus' />
      ))}
    </LoadingRhombus>
  );
};
