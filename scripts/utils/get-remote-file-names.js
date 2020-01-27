'use strict';

const getS3 = require('./get-s3');

const getRemoteFileNames = (s3 = getS3(), ContinuationToken) =>
  s3
    .listObjectsV2({ ContinuationToken })
    .promise()
    .then(({ Contents, IsTruncated, NextContinuationToken }) => {
      const fileNames = Contents.map(({ Key }) => Key);
      if (IsTruncated) {
        return getRemoteFileNames(
          s3,
          NextContinuationToken
        ).then(nextFileNames => fileNames.concat(nextFileNames));
      }
      return fileNames;
    });

module.exports = getRemoteFileNames;
