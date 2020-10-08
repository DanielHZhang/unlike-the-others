import styled from '@emotion/styled';

export const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  width: 300px;

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid #fff;
  }
  &::before {
    margin-right: 0.5em;
  }
  &::after {
    margin-left: 0.5em;
  }
`;

// export const Divider = () => {
//   return <div className='separator'>Next section</div>;
// };
