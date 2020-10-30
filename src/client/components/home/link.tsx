import styled from '@emotion/styled';
import {FC} from 'react';
import {Link, LinkProps} from 'wouter';

// Use FC here because Link will always require children and to fix an issue where styled
// is suppressing LinkProps.
export const HomepageLink: FC<LinkProps> = styled(Link)`
  display: block;
  color: #9b9f9f;
  text-decoration: none;
  position: relative;

  &::after {
    border-radius: 8px;
    content: '';
    background: white;
    mix-blend-mode: exclusion;
    width: calc(100% + 20px);
    height: 0;
    position: absolute;
    bottom: -4px;
    left: -10px;
    transition: all 0.3s cubic-bezier(0.445, 0.05, 0.55, 0.95);
  }

  &:hover::after {
    height: calc(100% + 8px);
  }
`;
