'use strict';

const sequentialPromises = require('./sequential-promises');
const getS3 = require('./get-s3');
const downloadRemoteFile = require('./download-remote-file');

const downloadRemoteFiles = remoteFileNames => {
  const s3 = getS3();
  return sequentialPromises(
    remoteFileNames.map(remoteFileName => () =>
      downloadRemoteFile(remoteFileName, s3)
    ),
    'Downloading Files',
    'files downloaded'
  );
};

module.exports = downloadRemoteFiles;
