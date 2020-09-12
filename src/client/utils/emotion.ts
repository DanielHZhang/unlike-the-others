import isPropValid from '@emotion/is-prop-valid';

const whitelist = ['name'];
const blacklist = ['flow', 'width', 'spacing'];

export function shouldForwardProp(prop: string) {
  return whitelist.includes(prop) || (isPropValid(prop) && !blacklist.includes(prop));
}
