import {motion} from 'framer-motion';
import React, {FC} from 'react';
import {useForm} from 'react-hook-form';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {Flex, Input, MotionButton, MotionInput, Stack} from 'src/client/components/base';
import {LinkDivider} from 'src/client/components/icons/link-divider';
import {HomepageLink} from 'src/client/components/link';

// TODO: your username can only contain alphanumeric characters and spaces

export const SignUpPage: FC = () => {
  const {register, handleSubmit, watch, errors} = useForm();
  const onSubmit = (data: any) => null;

  return (
    <RouteTransition>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack flow='column' crossAxis='center' spacing='1rem' style={{margin: '6rem 0'}}>
          <motion.div key='username' variants={childVariants}>
            <Input
              ref={register({required: true})}
              name='username'
              placeholder='Username'
              css={{width: 300}}
            />
          </motion.div>
          <MotionInput
            ref={register({required: true})}
            name='email'
            key='email'
            variants={childVariants}
            type='email'
            placeholder='Email'
            css={{width: 300}}
          />
          <MotionInput
            ref={register({required: true})}
            name='password'
            key='password'
            variants={childVariants}
            type='password'
            placeholder='Password'
            css={{width: 300}}
          />
          <MotionButton key='button' type='submit' variants={childVariants}>
            Sign Up
          </MotionButton>
        </Stack>
      </form>
      {/* Section below can be converted to component and reused in home/sign-up */}
      <Flex flow='column' crossAxis='center' style={{marginBottom: '2rem'}}>
        <motion.div key='login' variants={childVariants}>
          <HomepageLink to='/login'>Login</HomepageLink>
        </motion.div>
        <motion.div key='divider' variants={childVariants}>
          <LinkDivider />
        </motion.div>
        <motion.div key='home' variants={childVariants}>
          <HomepageLink to='/'>Home</HomepageLink>
        </motion.div>
      </Flex>
      {/* end section */}
    </RouteTransition>
  );
};
