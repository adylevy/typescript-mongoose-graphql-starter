import * as Utils  from './modules/utils';
import * as Dotenv from 'dotenv';
import * as Path   from 'path';
const generateRsaKeyPair = require('generate-rsa-keypair');

Dotenv.load();

export const PasswordSalt = Utils.tryReadEnv('PASSWORD_SALT');
export const Port         = Utils.tryReadEnv('PORT');
export const DatabaseUrl  = Utils.tryReadEnv('DATABASE_URL');

export const Frontend = {
    DistDir:       pathFromRoot('dist'),
    AssetsDir:     pathFromRoot('assets'),
    IndexHtmlPath: pathFromRoot('dist/index.html')
};


export const JWT = {
    // expressed in seconds or a string describing a time span zeit/ms. Eg: 60, "2 days", "10h", "7d"
    ExpirationTime:    '7d',
    EncodingAlgorithm: 'RS256',
    KeyPair:            generateRsaKeyPair(),
};









function pathFromRoot(relativePath: string) {
    return Path.normalize(Path.join(__dirname, '../../', relativePath));
}
