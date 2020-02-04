'use strict';

const { S3 } = require('aws-sdk');
const { s3BucketName } = require('./env');

const getS3 = () =>
  new S3({
    apiVersion: '2006-03-01',
    params: { Bucket: s3BucketName },
  });

module.exports = getS3;
