/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Scrypt password-based key derivation function.                         (c) C.Veness 2018-2019  */
/*                                                                                   MIT Licence  */
/*                                                                                                */
/* The function derives one or more secret keys from a secret string. It is based on memory-hard  */
/* functions, which offer added protection against attacks using custom hardware.                 */
/*                                                                                                */
/* www.tarsnap.com/scrypt.html, tools.ietf.org/html/rfc7914                                       */
/*                                                                                                */
/* This implementation is a zero-dependency wrapper providing access to the OpenSSL scrypt        */
/* function, returning a derived key with scrypt parameters and salt in Colin Percival's standard */
/* file header format, and a function for verifying that key against the original password.       */
/*                                                                                                */
/* Requires Node.js 10.5.0 or above: see github.com/chrisveness/scrypt-kdf#openssl-implementation */
/* (unless crypto.scrypt is polyfilled with scrypt-async - in which case v8.5.0+).                */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

import crypto from 'crypto';
import os from 'os';
import {performance} from 'perf_hooks';
import {TextEncoder} from 'util';

type KDFParams = {
  /** CPU/memory cost parameter. */
  logN: number;
  /** Block size parameter. */
  r: number;
  /** Parallelization parameter. */
  p: number;
};

function scrypt(
  password: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  keylen: number,
  options: crypto.ScryptOptions
) {
  return new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, options, (error, derivedKey) => {
      if (error) {
        reject(error);
      } else {
        resolve(derivedKey);
      }
    });
  });
}

function getDerivedKeyStructure(buffer: ArrayBuffer) {
  return {
    scrypt: new Uint8Array(buffer, 0, 6),
    params: {
      v: new DataView(buffer, 6, 1),
      logN: new DataView(buffer, 7, 1),
      r: new DataView(buffer, 8, 4),
      p: new DataView(buffer, 12, 4),
    },
    salt: new Uint8Array(buffer, 16, 32),
    checksum: new Uint8Array(buffer, 48, 16),
    hmachash: new Uint8Array(buffer, 64, 32),
  };
}

/**
 * Produce derived key using scrypt as a key derivation function.
 * @param password - Secret value such as a password from which key is to be derived.
 * @param params - Scrypt parameters.
 * @returns Derived key.
 * @example const key = (await kdf('my secret password', {logN: 15})).toString('base64');
 */
export async function hashPassword(
  password: string | Buffer,
  params: KDFParams = {logN: 15, r: 8, p: 1}
): Promise<string> {
  // range-check logN, r, p
  const logN = Math.round(params.logN);
  const r = Math.round(params.r);
  const p = Math.round(params.p);
  if (isNaN(logN) || logN !== params.logN) {
    throw new RangeError(`Parameter logN must be an integer; received ${params.logN}`);
  }
  if (logN < 1 || logN > 30) {
    throw new RangeError(`Parameter logN must be between 1 and 30; received ${params.logN}`);
  }
  if (isNaN(r) || r !== params.r || r <= 0) {
    throw new RangeError(`Parameter r must be a positive integer; received ${params.r}`);
  }
  if (isNaN(p) || p !== params.p || p <= 0) {
    throw new RangeError(`Parameter p must be a positive integer; received ${params.p}`);
  }
  if (p > (2 ** 30 - 1) / r) {
    throw new RangeError('Parameters p*r must be <= 2^30-1');
  }

  // the derived key is 96 bytes: use an ArrayBuffer to view it in different formats
  const buffer = new ArrayBuffer(96);
  // a structured view of the derived key
  const struct = getDerivedKeyStructure(buffer);

  // set params
  struct.scrypt.set(new TextEncoder().encode('scrypt')); // convert string to Uint8Array
  struct.params.logN.setUint8(0, logN);
  struct.params.r.setUint32(0, r, false); // big-endian
  struct.params.p.setUint32(0, p, false); // big-endian

  // set salt
  struct.salt.set(crypto.randomBytes(32));

  // set checksum of params & salt
  const prefix48 = new Uint8Array(buffer, 0, 48);
  struct.checksum.set(crypto.createHash('sha256').update(prefix48).digest().slice(0, 16));

  // set HMAC hash from scrypt-derived key
  try {
    // const keyParams
    const options = {
      N: 2 ** logN,
      r: r,
      p: p,
      maxmem: 2 ** 31 - 1, // 2GB is maximum maxmem allowed
    };
    // apply scrypt kdf to salt to derive hmac key
    const hmacKey = await scrypt(password, struct.salt, 64, options);

    // get hmachash of params, salt, & checksum, using 1st 32 bytes of scrypt hash as key
    const prefix64 = new Uint8Array(buffer, 0, 64);
    const hmacHash = crypto.createHmac('sha256', hmacKey.slice(32)).update(prefix64).digest();
    struct.hmachash.set(hmacHash);

    return Buffer.from(buffer).toString('base64'); // return ArrayBuffer as Buffer/Uint8Array
  } catch (e) {
    throw new Error(e.message); // e.g. memory limit exceeded; localise error to this function
  }
}

/**
 * Check whether key was generated from passphrase.
 * @param attempt - Derived key obtained from Scrypt.kdf().
 * @param truth - Passphrase originally used to generate key.
 * @returns True if key was generated from passphrase.
 * @example
 *   const key = (await hashPassword('my secret password', {logN: 15})).toString('base64');
 *   const valid = await verifyPassword(Buffer.from(key, 'base64'), 'my secret password');
 */
export async function verifyPassword(attempt: string, truth: string | Buffer): Promise<boolean> {
  const key = Buffer.from(attempt, 'base64');
  if (key.length !== 96) {
    throw new RangeError('Invalid key');
  }

  // use the underlying ArrayBuffer to view key in different formats
  const buffer = key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength);
  const struct = getDerivedKeyStructure(buffer); // a structured view of the derived key

  // verify checksum of params & salt
  const prefix48 = new Uint8Array(buffer, 0, 48);
  const checksum = crypto.createHash('sha256').update(prefix48).digest().slice(0, 16);

  if (!crypto.timingSafeEqual(checksum, struct.checksum)) {
    return false;
  }

  // rehash scrypt-derived key
  try {
    const params = {
      N: 2 ** struct.params.logN.getUint8(0),
      r: struct.params.r.getUint32(0, false), // big-endian
      p: struct.params.p.getUint32(0, false), // big-endian
      maxmem: 2 ** 31 - 1, // 2GB is maximum allowed
    };

    // apply scrypt kdf to salt to derive hmac key
    const hmacKey = await scrypt(truth, struct.salt, 64, params);

    // get hmachash of params, salt, & checksum, using 1st 32 bytes of scrypt hash as key
    const prefix64 = new Uint8Array(buffer, 0, 64);
    const hmacHash = crypto.createHmac('sha256', hmacKey.slice(32)).update(prefix64).digest();

    // verify hash
    return crypto.timingSafeEqual(hmacHash, struct.hmachash);
  } catch (e) {
    throw new Error(e.message); // localise error to this function [can't happen?]
  }
}

/**
 * View scrypt parameters which were used to derive key.
 * @param key - Derived base64 key obtained from Scrypt.kdf().
 * @returns Scrypt parameters logN, r, p.
 * @example
 *   const key = await hashPassword('my secret password', { logN: 15 } );
 *   const params = viewScryptParams(key); // => { logN: 15, r: 8, p: 1 }
 */
export function viewScryptParams(key: Buffer | Uint8Array) {
  if (key.length !== 96) {
    throw new RangeError('Invalid key');
  }
  // use the underlying ArrayBuffer to view key in structured format
  const buffer = key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength);
  const struct = getDerivedKeyStructure(buffer); // a structured view of the derived key
  return {
    logN: struct.params.logN.getUint8(0),
    r: struct.params.r.getUint32(0, false), // big-endian
    p: struct.params.p.getUint32(0, false), // big-endian
  };
}

/**
 * Calculate scrypt parameters from maxtime, maxmem, maxmemfrac values.
 * Adapted from Colin Percival's code: see github.com/Tarsnap/scrypt/tree/master/lib.
 * Returned parameters may vary depending on computer specs & current loading.
 * @param maxtime - Maximum time in seconds scrypt will spend computing the derived key.
 * @param maxmem - Maximum bytes of RAM used when computing the derived encryption key.
 * @param maxmemfrac - Fraction of the available RAM used when computing the derived key.
 * @returns Scrypt parameters logN, r, p.
 * @example
 *   const params = pickScryptParams(0.1); // => e.g. { logN: 15, r: 8, p: 1 }
 */
export function pickScryptParams(maxtime: number, maxmem = os.totalmem(), maxmemfrac = 0.5) {
  if (maxmem === 0 || maxmem === null) {
    maxmem = os.totalmem();
  }
  if (maxmemfrac === 0 || maxmemfrac > 0.5) {
    maxmemfrac = 0.5;
  }
  // memory limit is memfrac · physical memory, no more than maxmem and no less than 1MiB
  const physicalMemory = os.totalmem();
  const memlimit = Math.max(Math.min(physicalMemory * maxmemfrac, maxmem), 1024 * 1024);

  // Colin Percival measures how many scrypts can be done in one clock tick using C/POSIX
  // clock_getres() / CLOCKS_PER_SEC (usually just one?); we will use performance.now() to get
  // a DOMHighResTimeStamp. (Following meltdown/spectre timing attacks Chrome reduced the high
  // res timestamp resolution to 100µs, so we'll be conservative and do a 1ms run - typically
  // 1..10 minimal scrypts).
  let i = 0;
  const start = performance.now();
  while (performance.now() - start < 1) {
    crypto.scryptSync('', '', 64, {N: 128, r: 1, p: 1});
    i += 512; // we invoked the salsa20/8 core 512 times
  }
  const duration = (performance.now() - start) / 1000; // in seconds
  const opps = i / duration;

  // allow a minimum of 2^15 salsa20/8 cores
  const opslimit = Math.max(opps * maxtime, 2 ** 15);
  const r = 8; // "fix r = 8 for now"

  // memory limit requires that 128·N·r <= memlimit
  // CPU limit requires that 4·N·r·p <= opslimit
  // if opslimit < memlimit/32, opslimit imposes the stronger limit on N
  let p = null;
  let logN = 0;
  if (opslimit < memlimit / 32) {
    // set p = 1 & choose N based on CPU limit
    p = 1;
    const maxN = opslimit / (r * 4);
    while (1 << logN <= maxN / 2 && logN < 63) {
      logN++;
    }
  } else {
    // set N based on the memory limit
    const maxN = memlimit / (r * 128);
    while (1 << logN <= maxN / 2 && logN < 63) {
      logN++;
    }
    // choose p based on the CPU limit
    const maxrp = Math.min(opslimit / 4 / (1 << logN), 0x3fffffff);
    p = Math.round(maxrp / r);
  }
  return {logN, r, p};
}
