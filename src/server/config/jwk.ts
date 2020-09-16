import fs from 'fs';
import path from 'path';
import {JWK} from 'jose';

let jwk: JWK.RSAKey;

export function getJWK() {
  if (jwk) {
    return jwk;
  }
  // check for error?
  const buffer = fs.readFileSync(path.join(process.cwd(), '.local', 'jwk.pem'));
  jwk = JWK.asKey(buffer) as JWK.RSAKey;
  return jwk;
}
