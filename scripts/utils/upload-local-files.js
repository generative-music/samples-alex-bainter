'use strict';

const sequentialPromises = require('./sequential-promises');
const uploadLocalFile = require('./upload-local-file');
const getS3 = require('./get-s3');

const uploadLocalFiles = localFileNames => {
  const s3 = getS3();
  return sequentialPromises(
    localFileNames.map(localFileName => () =>
      uploadLocalFile(localFileName, s3)
    ),
    'Uploading Files',
    'files uploaded'
  );
};

module.exports = uploadLocalFiles;
