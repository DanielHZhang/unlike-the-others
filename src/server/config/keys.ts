import fs from 'fs';
import path from 'path';
import {JWK, JWKS, JWT, errors} from 'jose';
import {LOCAL_FOLDER_PATH} from 'src/server/config/constants';
import type {JwtClaims} from 'src/shared/types';

type JwtType = 'access' | 'refresh';

const refreshKey = JWK.asKey(fs.readFileSync(path.join(LOCAL_FOLDER_PATH, 'refresh.pem')));
const accessKey = JWK.asKey(fs.readFileSync(path.join(LOCAL_FOLDER_PATH, 'access.pem')));
const keyStore = new JWKS.KeyStore([refreshKey, accessKey]);

export function verifyJwt(type: JwtType, jwt: undefined): never;
export function verifyJwt(type: JwtType, jwt: string): Required<JwtClaims>;
export function verifyJwt(type: JwtType, jwt: string | undefined): Required<JwtClaims> | never;
export function verifyJwt(type: JwtType, jwt: string | undefined): Required<JwtClaims> | never {
  if (!jwt) {
    throw new errors.JWTMalformed();
  }
  const claims = JWT.verify(jwt, type === 'refresh' ? refreshKey : accessKey);
  return claims as Required<JwtClaims>;
}

export function signJwt(type: JwtType, data: JwtClaims): string {
  const newJwt = JWT.sign(data, type === 'refresh' ? refreshKey : accessKey);
  return newJwt;
}
