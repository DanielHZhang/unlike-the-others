/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion} from 'framer-motion';
import {childVariants} from 'src/client/components/animation/route-transition';
import {Flex, Icon} from 'src/client/components/base';
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
    <Flex flow='column' crossAxis='center' css={{marginBottom: '2rem'}}>
      <motion.div key={upper.url} variants={childVariants}>
        <HomepageLink to={upper.url}>{upper.text}</HomepageLink>
      </motion.div>
      <motion.div key='divider' variants={childVariants}>
        <Icon.Scale />
      </motion.div>
      <motion.div key={lower.url} variants={childVariants}>
        <HomepageLink to={lower.url}>{lower.text}</HomepageLink>
      </motion.div>
    </Flex>
  );
};
