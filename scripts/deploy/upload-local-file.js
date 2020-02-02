'use strict';

const fs = require('fs');
const { createGzip } = require('zlib');
const { lookup } = require('mime-types');
const getS3 = require('../utils/get-s3');

const uploadLocalFile = (localFileName, s3 = getS3()) =>
  s3
    .upload({
      Key: localFileName.replace('./dist/', ''),
      Body: fs.createReadStream(localFileName).pipe(createGzip()),
      ACL: 'public-read',
      ContentType: lookup(localFileName) || '',
      ContentEncoding: 'gzip',
      CacheControl: 'max-age=31536000',
    })
    .promise();

module.exports = uploadLocalFile;
