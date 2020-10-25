import {motion, useIsPresent, usePresence, Variants} from 'framer-motion';
import React, {FC, useState} from 'react';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {Flex, Icon, MotionButton, MotionInput, Stack} from 'src/client/components/base';
import {HomepageLink} from 'src/client/components/link';
import {useDidMount} from 'src/client/hooks';

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
    <RouteTransition>
      <Stack flow='column' crossAxis='center' spacing='1rem' style={{margin: '6rem 0'}}>
        <MotionInput
          key='emailInput'
          variants={childVariants}
          type='email'
          placeholder='Username or email'
          style={{width: 300}}
        />
        <MotionInput
          key='passwordInput'
          variants={childVariants}
          type='password'
          placeholder='Password'
          style={{width: 300}}
        />
        <MotionButton key='loginButton' variants={childVariants}>
          {/* <motion.button key='loginButton' variants={childVariants}> */}
          Login
          {/* </motion.button> */}
        </MotionButton>
      </Stack>
      {/* Section below can be converted to component and reused in home/sign-up */}
      <Flex flow='column' crossAxis='center' style={{marginBottom: '2rem'}}>
        <motion.div key='/sign-up' variants={childVariants}>
          <HomepageLink to='/sign-up'>Sign Up</HomepageLink>
        </motion.div>
        <motion.div key='divider' variants={childVariants}>
          <Icon.Scale />
        </motion.div>
        <motion.div key='/' variants={childVariants}>
          <HomepageLink to='/'>Home</HomepageLink>
        </motion.div>
      </Flex>
      {/* end section */}
    </RouteTransition>
  );
};
