const crypto = require('crypto');
// const {} = require('nanoid');

const salt = 'cool';
const secret = 'secret';

const str = salt + '-' + secret;
const hash = crypto.createHash('sha1').update(str, 'ascii').digest('base64');

console.log('salt:', salt);
console.log('secret:', secret);

console.log('generated hash:', hash);
console.log('final token:', salt + '-' + hash);
