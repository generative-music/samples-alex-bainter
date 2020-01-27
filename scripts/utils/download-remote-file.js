'use strict';

const fs = require('fs');
const path = require('path');
const { createGunzip } = require('zlib');
const getS3 = require('./get-s3');

const pfs = fs.promises;

const downloadStream = (remoteFileName, s3) =>
  s3.getObject({ Key: remoteFileName }).createReadStream();

const downloadRemoteFile = (remoteFileName, s3 = getS3()) => {
  const localFileName = `./dist/${remoteFileName}`;
  return pfs.mkdir(path.dirname(localFileName), { recursive: true }).then(
    () =>
      new Promise(resolve => {
        const writeStream = fs.createWriteStream(localFileName);
        downloadStream(remoteFileName, s3)
          .pipe(createGunzip())
          .pipe(writeStream)
          .on('finish', resolve);
      })
  );
};

module.exports = downloadRemoteFile;
