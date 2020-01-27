'use strict';

const sequentialPromises = require('../utils/sequential-promises');
const getS3 = require('../utils/get-s3');
const uploadLocalFile = require('./upload-local-file');

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
