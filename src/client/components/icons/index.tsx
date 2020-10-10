/** @jsx jsx */
import {css, jsx} from '@emotion/react';
import {memo} from 'react';

export * from './arrow-right';

type Props = {
  type: 'close';
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
      default: {
        return null;
      }
    }
  },
  () => true
);
