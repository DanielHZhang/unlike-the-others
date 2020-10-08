/** @jsx jsx */
import {css, jsx} from '@emotion/react';
import {memo} from 'react';

type Props = {
  type: 'close' | 'arrow-right';
};

export const Icon = memo(
  (props: Props) => {
    switch (props.type) {
      case 'close': {
        return (
          <i
            css={css`
              & {
                box-sizing: border-box;
                position: relative;
                display: block;
                transform: scale(var(--ggs, 1));
                width: 22px;
                height: 22px;
                border: 2px solid transparent;
                border-radius: 40px;
              }
              &::after,
              &::before {
                content: '';
                display: block;
                box-sizing: border-box;
                position: absolute;
                width: 16px;
                height: 2px;
                background: currentColor;
                transform: rotate(45deg);
                border-radius: 5px;
                top: 8px;
                left: 1px;
              }
              &::after {
                transform: rotate(-45deg);
              }
            `}
          />
        );
      }
      case 'arrow-right': {
        return (
          <i
            css={css`
              & {
                box-sizing: border-box;
                position: relative;
                display: block;
                transform: scale(var(--ggs, 1));
                width: 22px;
                height: 22px;
              }
              &::after,
              &::before {
                content: '';
                display: block;
                box-sizing: border-box;
                position: absolute;
                right: 3px;
              }
              &::after {
                width: 8px;
                height: 8px;
                border-top: 2px solid;
                border-right: 2px solid;
                transform: rotate(45deg);
                bottom: 7px;
              }
              &::before {
                width: 16px;
                height: 2px;
                bottom: 10px;
                background: currentColor;
              }
            `}
          />
        );
      }
      default: {
        return null;
      }
    }
  },
  () => true
);
