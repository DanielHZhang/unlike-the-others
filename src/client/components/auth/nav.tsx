/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion} from 'framer-motion';
import {childVariants} from 'src/client/components/animation/route';
import {Icon, MotionFlex, Stack} from 'src/client/components/base';
import {HomepageLink} from 'src/client/components/home/link';

type Link = {
  url: string;
  text: string;
};

type Props = {
  upper: Link;
  lower: Link;
};

export const AuthNav = ({upper, lower}: Props): JSX.Element => {
  return (
    <Stack flow='column' crossAxis='center' css={{marginBottom: '2rem', letterSpacing: '2px'}}>
      <motion.div key={upper.url} variants={childVariants}>
        <HomepageLink to={upper.url}>{upper.text}</HomepageLink>
      </motion.div>
      <MotionFlex key='divider' variants={childVariants} crossAxis='center'>
        <Icon.Scale />
      </MotionFlex>
      <motion.div key={lower.url} variants={childVariants}>
        <HomepageLink to={lower.url}>{lower.text}</HomepageLink>
      </motion.div>
    </Stack>
  );
};
