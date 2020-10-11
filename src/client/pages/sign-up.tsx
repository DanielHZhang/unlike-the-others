import React from 'react';
import {Button, Flex, Input, Stack} from 'src/client/components/base';
import {LinkDivider} from 'src/client/components/icons/link-divider';
import {HomeLayout} from 'src/client/components/layout';
import {HomepageLink} from 'src/client/components/link';

// TODO: your username can only contain alphanumeric characters and spaces

export const SignUpPage = () => {
  return (
    <HomeLayout>
      <Stack flow='column' crossAxis='center' spacing='1rem' style={{margin: '6rem 0'}}>
        <Input placeholder='Username' style={{width: 300}} />
        <Input type='email' placeholder='Email' style={{width: 300}} />
        <Input type='password' placeholder='Password' style={{width: 300}} />
        <Button>Sign Up</Button>
      </Stack>
      {/* Section below can be converted to component and reused in home/sign-up */}
      <Flex flow='column' crossAxis='center' style={{marginBottom: '2rem'}}>
        <HomepageLink to='/login'>Login</HomepageLink>
        <LinkDivider />
        <HomepageLink to='/'>Home</HomepageLink>
      </Flex>
      {/* end section */}
    </HomeLayout>
  );
};
