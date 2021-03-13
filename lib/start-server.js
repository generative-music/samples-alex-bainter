'use strict';

const path = require('path');
const os = require('os');
const fs = require('fs');
const zlib = require('zlib');
const aws = require('aws-sdk');
const express = require('express');
const cors = require('cors');
const mime = require('mime');

const fsp = fs.promises;

const BUCKET_NAME = 'samples.alexbainter.com';
const CACHE_DIR = path.join(os.homedir(), `.samples-alex-bainter`);

const app = express();
app.use(cors());

let s3;

const gunzip = buffer =>
  new Promise((resolve, reject) =>
    zlib.gunzip(buffer, (err, gunzippedBuffer) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(gunzippedBuffer);
    })
  );

const retrieveFile = remoteFilename => {
  const localPath = path.join(CACHE_DIR, remoteFilename);
  return fsp.readFile(localPath).catch(() => {
    if (typeof s3 === 'undefined') {
      s3 = new aws.S3({
        apiVersion: '2006-03-01',
        params: { Bucket: BUCKET_NAME },
      });
    }
    return s3
      .getObject({ Key: remoteFilename })
      .promise()
      .then(({ Body, ContentEncoding }) =>
        ContentEncoding === 'gzip' ? gunzip(Body) : Body
      )
      .then(buffer =>
        fsp
          .mkdir(path.dirname(localPath), { recursive: true })
          .then(() => fsp.writeFile(localPath, buffer).then(() => buffer))
      );
  });
};

app.get('*', (req, res) => {
  const remoteFilename = req.path.slice(1);
  retrieveFile(remoteFilename)
    .then(file => {
      res.set('Content-Type', mime.getType(remoteFilename));
      res.send(file);
    })
    .catch(err => {
      console.error(err);
      res.sendStatus(500);
    });
});

const startServer = ({ port } = {}) =>
  new Promise(resolve =>
    app.listen(port || process.env.SAMPLE_FILE_PORT || 6969, () => resolve(app))
  );

module.exports = startServer;
