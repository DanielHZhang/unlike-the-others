import fs from 'fs';
import path from 'path';
import {JWK, JWKS, JWT} from 'jose';
import {LOCAL_FOLDER_PATH} from 'src/server/config/constants';
import type {JwtClaims} from 'src/shared/types';

type JwtType = 'access' | 'refresh';

const refreshKey = JWK.asKey(fs.readFileSync(path.join(LOCAL_FOLDER_PATH, 'refresh.pem')));
const accessKey = JWK.asKey(fs.readFileSync(path.join(LOCAL_FOLDER_PATH, 'access.pem')));
const keyStore = new JWKS.KeyStore([refreshKey, accessKey]);

export function verifyJwt(type: JwtType, jwt: string) {
  const claims = JWT.verify(jwt, type === 'refresh' ? refreshKey : accessKey);
  return claims as Required<JwtClaims>;
}

export function signJwt(
  type: JwtType,
  data: Pick<JwtClaims, 'userId'> | Pick<JwtClaims, 'guestId'>
) {
  const newJwt = JWT.sign(data, type === 'refresh' ? refreshKey : accessKey);
  return newJwt;
}
