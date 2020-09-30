import fs from 'fs';
import path from 'path';
import {JWK, JWKS, JWT} from 'jose';
import {JwtClaims} from 'src/shared/types';

const key = JWK.asKey(fs.readFileSync(path.join(process.cwd(), '.local', 'jwk.pem')));
const keyStore = new JWKS.KeyStore([key]);

export function verifyJwt(jwt: string) {
  const claims = JWT.verify(jwt, key);
  return claims as JwtClaims;
}

export function signJwt(data: Partial<JwtClaims>) {
  const newJwt = JWT.sign(data, key);
  return newJwt;
}
