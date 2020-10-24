import React, {FC} from 'react';

/* eslint-disable max-len */

export namespace Icon {
  type Props = {
    size?: number;
    color?: string;
  };

  export const ArrowRight: FC<Props> = ({size = 24, color = '#000000'}) => (
    <svg
      width={size}
      height={size}
      viewBox='0 0 24 24'
      fill='none'
      stroke={color}
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d='M5 12h13M12 5l7 7-7 7' />
    </svg>
  );

  export const Scale: FC<Props> = ({size = 20, color = '#3B3D3D'}) => (
    <svg width={size} height={size} viewBox='0 0 24 24' style={{margin: '8px 0 4px 0'}}>
      <path
        fill={color}
        d='M23 13.8a1 1 0 000-.2l-2.4-6A3 3 0 0022 5a1 1 0 00-2 0 1 1 0 01-1.9.5A2.9 2.9 0 0015.5 4H13V3a1 1 0 00-2 0v1H8.5a2.9 2.9 0 00-2.6 1.5A1 1 0 014 5a1 1 0 00-2 0 3 3 0 001.4 2.5L1 13.6a1 1 0 000 .2 1 1 0 00-.1.2 4 4 0 008 0 1 1 0 000-.2 1 1 0 000-.2L6.5 7.5a3 3 0 001-1 1 1 0 01.9-.5H11v14H8a1 1 0 000 2h8a1 1 0 000-2h-3V6h2.5a1 1 0 01.9.4 3 3 0 001 1.1L15 13.6a1 1 0 000 .2 1 1 0 00-.1.2 4 4 0 008 0 1 1 0 000-.2zm-18-5L6.6 13H3.4zM6.7 15A2 2 0 015 16a2 2 0 01-1.7-1zM19 8.9l1.6 4.1h-3.2zm0 7.1a2 2 0 01-1.7-1h3.4a2 2 0 01-1.7 1z'
      />
    </svg>
  );

  export const AtSign: FC<Props> = ({size = 24, color = '#000000'}) => (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      <path
        fill={color}
        d='M12,2a10,10,0,1,0,5,18.66,1,1,0,1,0-1-1.73A8,8,0,1,1,20,12v.75a1.75,1.75,0,0,1-3.5,0V8.5a1,1,0,0,0-1-1,1,1,0,0,0-1,.79A4.45,4.45,0,0,0,12,7.5,4.5,4.5,0,1,0,15.3,15,3.74,3.74,0,0,0,22,12.75V12A10,10,0,0,0,12,2Zm0,12.5A2.5,2.5,0,1,1,14.5,12,2.5,2.5,0,0,1,12,14.5Z'
      />
    </svg>
  );
}
