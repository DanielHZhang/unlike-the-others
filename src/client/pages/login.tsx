import {motion, useIsPresent, usePresence, Variants} from 'framer-motion';
import React, {FC, useState} from 'react';
import {Button, Flex, Input, Stack} from 'src/client/components/base';
import {LinkDivider} from 'src/client/components/icons/link-divider';
import {HomeLayout} from 'src/client/components/layout';
import {HomepageLink} from 'src/client/components/link';
import {useDidMount} from 'src/client/hooks';

const containerVariants: Variants = {
  // hidden: {
  //   opacity: 0,
  //   y: 20,
  // },
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      duration: 0.8,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      duration: 0.8,
    },
  },
};

const childVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -40,
  },
};

export const LoginPage: FC = () => {
  // const [] = useState({username: '', email: '', password: ''});

  useDidMount(() => {
    console.log('mounting login page');
    return () => {
      console.log('unmounting login page');
    };
  });

  // const same = usePresence();
  // const what = useIsPresent();

  // console.log('use presence login:', same, what);

  return (
    <motion.div initial='hidden' animate='visible' exit='exit' variants={containerVariants}>
      <Stack flow='column' crossAxis='center' spacing='1rem' style={{margin: '6rem 0'}}>
        <Input type='email' placeholder='Username or email' style={{width: 300}} />
        <Input type='password' placeholder='Password' style={{width: 300}} />
        <Button>Login</Button>
      </Stack>
      {/* Section below can be converted to component and reused in home/sign-up */}
      <Flex flow='column' crossAxis='center' style={{marginBottom: '2rem'}}>
        <HomepageLink to='/sign-up'>Sign Up</HomepageLink>
        <LinkDivider />
        <HomepageLink to='/'>Home</HomepageLink>
      </Flex>
      {/* end section */}
    </motion.div>
  );
};
