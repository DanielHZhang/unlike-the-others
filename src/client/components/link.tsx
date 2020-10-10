import styled from '@emotion/styled';
import {Link} from 'react-router-dom';

export const HomepageLink = styled(Link)`
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
