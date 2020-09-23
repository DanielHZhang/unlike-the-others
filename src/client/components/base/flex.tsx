import styled from '@emotion/styled';
import {css} from '@emotion/react';
import {shouldForwardProp} from 'src/client/utils/emotion';

type Props = {
  flow?: 'row' | 'column';
  grow?: number;
  shrink?: number;
  /** `align-items`: Vertical axis for `row`, horizontal axis for `column` */
  crossAxis?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  /** `justify-content`: Horizontal axis for `row`, vertical axis for `column` */
  mainAxis?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  basis?: string;
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  order?: number;
};

export const Flex = styled('div', {shouldForwardProp})<Props>(
  ({flow = 'row', grow, shrink, crossAxis, mainAxis, basis, wrap, order}) => css`
    align-items: ${crossAxis};
    display: flex;
    flex-basis: ${basis};
    flex-flow: ${flow};
    flex-grow: ${grow};
    flex-shrink: ${shrink};
    flex-wrap: ${wrap};
    justify-content: ${mainAxis};
    order: ${order};
  `
);
