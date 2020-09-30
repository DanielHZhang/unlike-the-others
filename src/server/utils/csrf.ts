import crypto from 'crypto';
import {nanoid} from 'nanoid';
import {nanoid as nanoidAsync} from 'nanoid/async';

/**
 * Token generation/verification class.
 */
export class CsrfTokenizer {
  private static readonly EQUAL_REGEX = /=/g;
  private static readonly PLUS_REGEX = /\+/g;
  private static readonly SLASH_REGEX = /\//g;

  /** The string length of the salt */
  private saltLength: number;
  /** The byte length of the secret key */
  private secretLength: number;

  constructor() {
    this.saltLength = 8;
    this.secretLength = 18;
  }

  /**
   * Create a new CSRF token
   * @param secret The secret for the token.
   */
  public create(secret: string) {
    const salt = nanoid(this.saltLength);
    return this.tokenize(secret, salt);
  }

  /**
   * Create a new secret key asyncronously.
   */
  public secret() {
    return nanoidAsync(Math.floor(this.secretLength * 8 / 5));
  }

  /**
   * Tokenize a secret and salt.
   */
  private tokenize(secret: string, salt: string) {
    return salt + '-' + this.hash(salt + '-' + secret);
  }

  /**
   * Verify if a given token is valid for a given secret.
   */
  verify(secret: string, token: string) {
    if (!secret || typeof secret !== 'string') {
      return false;
    }
    if (!token || typeof token !== 'string') {
      return false;
    }

    const index = token.indexOf('-');

    if (index === -1) {
      return false;
    }

    const salt = token.substr(0, index);
    const expected = this.tokenize(secret, salt);
    return this.timeSafeCompare(token, expected);
  }

  private timeSafeCompare(a: string, b: string) {
    const key = crypto.pseudoRandomBytes(32);
    const ah = crypto.createHmac('sha256', key).update(a).digest();
    const bh = crypto.createHmac('sha256', key).update(b).digest();
    if (ah.length !== bh.length) {
      return false;
    }
    return crypto.timingSafeEqual(ah, bh) && a === b;
  }

  /**
   * Hash a string with SHA1, returning url-safe base64
   */
  private hash(str: string) {
    return crypto
      .createHash('sha1')
      .update(str, 'ascii')
      .digest('base64')
      .replace(CsrfTokenizer.PLUS_REGEX, '-')
      .replace(CsrfTokenizer.SLASH_REGEX, '_')
      .replace(CsrfTokenizer.EQUAL_REGEX, '');
  }
}
