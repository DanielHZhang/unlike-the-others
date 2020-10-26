import React from 'react';
import styled from '@emotion/styled';

type Props = {size: number; animationDuration: number};

const Spring = styled.div<Props>`
  height: ${(props) => props.size}px;
  width: ${(props) => props.size}px;
  * {
    box-sizing: border-box;
  }
  .spring-spinner-part {
    overflow: hidden;
    height: calc(${(props) => props.size}px / 2);
    width: ${(props) => props.size}px;
  }
  .spring-spinner-part.bottom {
    transform: rotate(180deg) scale(-1, 1);
  }
  .spring-spinner-rotator {
    width: ${(props) => props.size}px;
    height: ${(props) => props.size}px;
    border: calc(${(props) => props.size}px / 7) solid transparent;
    border-right-color: ${(props) => props.color};
    border-top-color: ${(props) => props.color};
    border-radius: 50%;
    box-sizing: border-box;
    animation: spring-spinner-animation ${(props) => props.animationDuration}ms ease-in-out infinite;
    transform: rotate(-200deg);
  }
  @keyframes spring-spinner-animation {
    0% {
      border-width: calc(${(props) => props.size}px / 7);
    }
    25% {
      border-width: calc(${(props) => props.size}px / 23.33);
    }
    50% {
      transform: rotate(115deg);
      border-width: calc(${(props) => props.size}px / 7);
    }
    75% {
      border-width: calc(${(props) => props.size}px / 23.33);
    }
    100% {
      border-width: calc(${(props) => props.size}px / 7);
    }
  }
`;

export const CircleSpringSpinner = (): JSX.Element => {
  const size = 24;
  const color = '#fff';
  const animationDuration = 3000;
  return (
    <Spring
      size={size}
      color={color}
      animationDuration={animationDuration}
      className='spring-spinner'
    >
      <div className='spring-spinner-part top'>
        <div className='spring-spinner-rotator' />
      </div>
      <div className='spring-spinner-part bottom'>
        <div className='spring-spinner-rotator' />
      </div>
    </Spring>
  );
};
