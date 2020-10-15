import {AnimatePresence} from 'framer-motion';
import React, {FC} from 'react';
import {Switch, useLocation} from 'react-router-dom';

type Props = {
  exitBeforeEnter?: boolean;
  initial?: boolean;
};

export const PresenceSwitch: FC<Props> = ({children, exitBeforeEnter = true, initial = false}) => {
  const location = useLocation();
  return (
    <AnimatePresence
      exitBeforeEnter={exitBeforeEnter}
      initial={initial}
      onExitComplete={() => console.log('outermost exit')}
    >
      <Switch location={location} key={location.pathname}>
        {children}
      </Switch>
    </AnimatePresence>
  );
};
