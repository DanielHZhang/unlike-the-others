import geckos from '@geckos.io/client';
import {TCP_PORT} from 'src/config/constants';

export const channel = geckos({port: TCP_PORT});
