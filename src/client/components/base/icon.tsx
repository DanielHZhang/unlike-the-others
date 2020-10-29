import React from 'react';

/* eslint-disable max-len */

export namespace Icon {
  type Props = {
    size?: number;
    color?: string;
  };

  export type Element = (props: Props) => JSX.Element;

  export const ArrowRight = ({size = 24, color = '#000'}: Props): JSX.Element => (
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

  export const Scale = ({size = 20, color = '#3B3D3D'}: Props): JSX.Element => (
    <svg width={size} height={size} viewBox='0 0 24 24' style={{margin: '8px 0 4px 0'}}>
      <path
        fill={color}
        d='M23 13.8a1 1 0 000-.2l-2.4-6A3 3 0 0022 5a1 1 0 00-2 0 1 1 0 01-1.9.5A2.9 2.9 0 0015.5 4H13V3a1 1 0 00-2 0v1H8.5a2.9 2.9 0 00-2.6 1.5A1 1 0 014 5a1 1 0 00-2 0 3 3 0 001.4 2.5L1 13.6a1 1 0 000 .2 1 1 0 00-.1.2 4 4 0 008 0 1 1 0 000-.2 1 1 0 000-.2L6.5 7.5a3 3 0 001-1 1 1 0 01.9-.5H11v14H8a1 1 0 000 2h8a1 1 0 000-2h-3V6h2.5a1 1 0 01.9.4 3 3 0 001 1.1L15 13.6a1 1 0 000 .2 1 1 0 00-.1.2 4 4 0 008 0 1 1 0 000-.2zm-18-5L6.6 13H3.4zM6.7 15A2 2 0 015 16a2 2 0 01-1.7-1zM19 8.9l1.6 4.1h-3.2zm0 7.1a2 2 0 01-1.7-1h3.4a2 2 0 01-1.7 1z'
      />
    </svg>
  );

  export const AtSign = ({size = 24, color = '#000'}: Props): JSX.Element => (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      <path
        fill={color}
        d='M12,2a10,10,0,1,0,5,18.66,1,1,0,1,0-1-1.73A8,8,0,1,1,20,12v.75a1.75,1.75,0,0,1-3.5,0V8.5a1,1,0,0,0-1-1,1,1,0,0,0-1,.79A4.45,4.45,0,0,0,12,7.5,4.5,4.5,0,1,0,15.3,15,3.74,3.74,0,0,0,22,12.75V12A10,10,0,0,0,12,2Zm0,12.5A2.5,2.5,0,1,1,14.5,12,2.5,2.5,0,0,1,12,14.5Z'
      />
    </svg>
  );

  export const User = ({size = 24, color = '#000'}: Props): JSX.Element => (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      <path
        fill={color}
        d='M15.71,12.71a6,6,0,1,0-7.42,0,10,10,0,0,0-6.22,8.18,1,1,0,0,0,2,.22,8,8,0,0,1,15.9,0,1,1,0,0,0,1,.89h.11a1,1,0,0,0,.88-1.1A10,10,0,0,0,15.71,12.71ZM12,12a4,4,0,1,1,4-4A4,4,0,0,1,12,12Z'
      />
    </svg>
  );

  export const Key = ({size = 24, color = '#000'}: Props): JSX.Element => (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      <path
        fill={color}
        d='M21.71,6.53,20.29,5.12l1.42-1.41a1,1,0,1,0-1.42-1.42L9.75,12.83a5,5,0,1,0,1.42,1.42l4.88-4.89,1.41,1.42a1,1,0,0,0,.71.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.42L17.46,8l1.42-1.42L20.29,8a1,1,0,0,0,.71.29A1,1,0,0,0,21.71,8,1,1,0,0,0,21.71,6.53ZM7,20a3,3,0,1,1,3-3A3,3,0,0,1,7,20Z'
      />
    </svg>
  );

  export const SyncExclamation = ({size = 24, color = '#000'}: Props): JSX.Element => (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      <path
        fill={color}
        d='M11.29,15.71A1,1,0,0,0,13,15a1.05,1.05,0,0,0-.29-.71,1,1,0,0,0-1.09-.21,1,1,0,0,0-.33.21A1.05,1.05,0,0,0,11,15,1,1,0,0,0,11.29,15.71Zm8.62-.2H15.38a1,1,0,0,0,0,2h2.4A8,8,0,0,1,4,12a1,1,0,0,0-2,0,10,10,0,0,0,16.88,7.23V21a1,1,0,0,0,2,0V16.5A1,1,0,0,0,19.91,15.51ZM12,2A10,10,0,0,0,5.12,4.77V3a1,1,0,0,0-2,0V7.5a1,1,0,0,0,1,1H8.62a1,1,0,0,0,0-2H6.22A8,8,0,0,1,20,12a1,1,0,0,0,2,0A10,10,0,0,0,12,2Zm0,11a1,1,0,0,0,1-1V9a1,1,0,0,0-2,0v3A1,1,0,0,0,12,13Z'
      />
    </svg>
  );

  export const Lock = ({size = 24, color = '#000'}: Props): JSX.Element => (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      <path
        fill={color}
        d='M17,9V7A5,5,0,0,0,7,7V9a3,3,0,0,0-3,3v7a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V12A3,3,0,0,0,17,9ZM9,7a3,3,0,0,1,6,0V9H9Zm9,12a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V12a1,1,0,0,1,1-1H17a1,1,0,0,1,1,1Z'
      />
    </svg>
  );

  export const Ecks = ({size = 24, color = '#000'}: Props): JSX.Element => (
    <svg width={size} height={size} viewBox='0 0 24 24'>
      <path
        fill={color}
        d='M13.41,12l6.3-6.29a1,1,0,1,0-1.42-1.42L12,10.59,5.71,4.29A1,1,0,0,0,4.29,5.71L10.59,12l-6.3,6.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0L12,13.41l6.29,6.3a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42Z'
      />
    </svg>
  );
}
