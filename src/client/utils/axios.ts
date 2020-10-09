import {AxiosError} from 'axios';
import type {FastifyReplyError} from 'src/shared/types';

export function isAxiosError(error: any): error is Required<AxiosError<FastifyReplyError>> {
  return error.isAxiosError && error.response && error.response.data;
}
