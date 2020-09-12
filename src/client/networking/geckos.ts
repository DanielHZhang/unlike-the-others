import geckos from '@geckos.io/client';
import {UDP_PORT} from 'src/config/constants';

export const channel = geckos({port: UDP_PORT});
