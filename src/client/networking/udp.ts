import geckos from '@geckos.io/client';
import {StorageKeys} from 'src/client/config/constants';
import {GECKOS_LABEL, PORT} from 'src/shared/constants';

export const channel = geckos({
  authorization: localStorage.getItem(StorageKeys.Jwt) || '',
  // label: GECKOS_LABEL,
  port: PORT,
});

console.log(channel.userData);

// channel.emit('connect', 'wow');

channel.onConnect((error) => {
  if (error) {
    console.error(error);
  } else {
  }
});
