import React from 'react';
import styled from '@emotion/styled';
import {styledOptions} from 'src/client/components/props';
import {css} from '@emotion/react';

const numRings = 9;
const containerPadding = 2;

type RingProps = Pick<SpinnerProps, 'duration'> & {ringBase: number};

const Ring = styled(
  'div',
  styledOptions
)<RingProps>(
  (props) => css`
    position: absolute;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: ${props.color};
    animation: fingerprint ${props.duration}ms cubic-bezier(0.68, -0.75, 0.265, 1.75) infinite
      forwards;
    margin: auto;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    color: ${props.color};

    &:nth-of-type(1) {
      height: ${props.ringBase + 0 * props.ringBase}px;
      width: ${props.ringBase + 0 * props.ringBase}px;
      animation-delay: calc(50ms * 1);
    }
    &:nth-of-type(2) {
      height: ${props.ringBase + 1 * props.ringBase}px;
      width: ${props.ringBase + 1 * props.ringBase}px;
      animation-delay: calc(50ms * 2);
    }
    &:nth-of-type(3) {
      height: ${props.ringBase + 2 * props.ringBase}px;
      width: ${props.ringBase + 2 * props.ringBase}px;
      animation-delay: calc(50ms * 3);
    }
    &:nth-of-type(4) {
      height: ${props.ringBase + 3 * props.ringBase}px;
      width: ${props.ringBase + 3 * props.ringBase}px;
      animation-delay: calc(50ms * 4);
    }
    &:nth-of-type(5) {
      height: ${props.ringBase + 4 * props.ringBase}px;
      width: ${props.ringBase + 4 * props.ringBase}px;
      animation-delay: calc(50ms * 5);
    }
    &:nth-of-type(6) {
      height: ${props.ringBase + 5 * props.ringBase}px;
      width: ${props.ringBase + 5 * props.ringBase}px;
      animation-delay: calc(50ms * 6);
    }
    &:nth-of-type(7) {
      height: ${props.ringBase + 6 * props.ringBase}px;
      width: ${props.ringBase + 6 * props.ringBase}px;
      animation-delay: calc(50ms * 7);
    }
    &:nth-of-type(8) {
      height: ${props.ringBase + 7 * props.ringBase}px;
      width: ${props.ringBase + 7 * props.ringBase}px;
      animation-delay: calc(50ms * 8);
    }
    &:nth-of-type(9) {
      height: ${props.ringBase + 8 * props.ringBase}px;
      width: ${props.ringBase + 8 * props.ringBase}px;
      animation-delay: calc(50ms * 9);
    }
  `
);

type WrapperProps = Pick<SpinnerProps, 'size'>;

const SpinnerWrapper = styled(
  'div',
  styledOptions
)<WrapperProps>(
  (props) => css`
    height: ${props.size}px;
    width: ${props.size}px;
    padding: ${containerPadding}px;
    overflow: hidden;
    position: relative;

    @keyframes fingerprint {
      100% {
        transform: rotate(360deg);
      }
    }
  `
);

type SpinnerProps = {
  size?: number;
  color?: string;
  duration?: number;
};

export const FingerprintSpinner = (props: SpinnerProps) => {
  const {size = 120, color = '#fff', duration = 1500} = props;
  const outerRingSize = size - containerPadding * 2;
  const ringBase = outerRingSize / numRings;

  return (
    <SpinnerWrapper size={size}>
      {Array.from({length: numRings}).map((_, index) => (
        <Ring key={index} color={color} ringBase={ringBase} duration={duration} />
      ))}
    </SpinnerWrapper>
  );
};
