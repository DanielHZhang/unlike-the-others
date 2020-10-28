import styled from '@emotion/styled';
import {Interpolation} from '@emotion/react';
import {motion} from 'framer-motion';
import {styledOptions} from 'src/client/components/props';
import {DeclaredTheme} from 'src/client/styles/theme';

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

type BaseProps = Props & {theme: DeclaredTheme};

// const baseFlexStyles = ({flow = 'row', ...props}: Props) => css`
//   align-items: ${props.crossAxis};
//   display: flex;
//   flex-basis: ${props.basis};
//   flex-flow: ${flow};
//   flex-grow: ${props.grow};
//   flex-shrink: ${props.shrink};
//   flex-wrap: ${props.wrap};
//   justify-content: ${props.mainAxis};
//   order: ${props.order};
// `;

const baseFlexStyles = ({flow = 'row', ...props}: BaseProps): Interpolation<any> => ({
  alignItems: props.crossAxis,
  display: 'flex',
  flexBasis: props.basis,
  flexFlow: flow,
  flexGrow: props.grow,
  flexShrink: props.shrink,
  flexWrap: props.wrap,
  justifyContent: props.mainAxis,
  order: props.order,
});

export const Flex = styled('div', styledOptions)<Props>`
  ${baseFlexStyles};
`;

export const MotionFlex = styled(motion.div)`
  ${baseFlexStyles}
`;

// export const Flex = styled(
//   'div',
//   styledOptions
// )<Props>(({flow = 'row', grow, shrink, crossAxis, mainAxis, basis, wrap, order}) => ({
//   alignItems: crossAxis,
//   display: 'flex',
//   flexBasis: basis,
//   flexFlow: flow,
//   flexGrow: grow,
//   flexShrink: shrink,
//   flexWrap: wrap,
//   justifyContent: mainAxis,
//   order,
// }));
