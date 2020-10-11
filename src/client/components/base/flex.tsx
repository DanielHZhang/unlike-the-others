import styled from '@emotion/styled';
import {styledOptions} from 'src/client/components/props';

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

export const Flex = styled(
  'div',
  styledOptions
)<Props>(({flow = 'row', grow, shrink, crossAxis, mainAxis, basis, wrap, order}) => ({
  alignItems: crossAxis,
  display: 'flex',
  flexBasis: basis,
  flexFlow: flow,
  flexGrow: grow,
  flexShrink: shrink,
  flexWrap: wrap,
  justifyContent: mainAxis,
  order,
}));
