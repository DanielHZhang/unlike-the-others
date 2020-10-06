import isPropValid from '@emotion/is-prop-valid';

const whitelist = ['name'];
const blacklist = ['flow', 'width', 'spacing', 'loading'];

export const styledOptions = {
  shouldForwardProp: (prop: string) =>
    whitelist.includes(prop) || (isPropValid(prop) && !blacklist.includes(prop)),
};
