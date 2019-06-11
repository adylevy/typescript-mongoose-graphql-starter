import * as Fs from 'fs';

for (const fileName of Fs.readdirSync(__dirname)) {
    if (fileName !== __filename) {
        void require(`./${fileName}`);
    }
}