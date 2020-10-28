import isPropValid from '@emotion/is-prop-valid';

const whitelist = ['name'];
const blacklist = ['flow', 'width', 'spacing', 'loading', 'color', 'size'];

export const styledOptions = {
  shouldForwardProp: (prop: string): boolean => {
    if (!prop) {
      console.log('some undefined rpop passed', prop);
    }
    return whitelist.includes(prop) || (isPropValid(prop) && !blacklist.includes(prop));
  },
};
