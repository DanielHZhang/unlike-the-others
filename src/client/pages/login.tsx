import React, {useState} from 'react';
import {Button, Flex, Input, Stack} from 'src/client/components/base';
import {LinkDivider} from 'src/client/components/icons/link-divider';
import {HomeLayout} from 'src/client/components/layout';
import {HomepageLink} from 'src/client/components/link';

export const LoginPage = () => {
  const [] = useState({username: '', email: '', password: ''});

  return (
    <HomeLayout>
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
    </HomeLayout>
  );
};
