#!/usr/bin/env node

'use strict';

const getRemoteFileNames = require('../utils/get-remote-file-names');
const getLocalDistFileNames = require('../utils/get-local-dist-file-names');
const uploadLocalFiles = require('./upload-local-files');

Promise.all([getLocalDistFileNames(), getRemoteFileNames()]).then(
  ([localFileNames, remoteFileNames]) => {
    const remoteFileNameSet = new Set(remoteFileNames);
    const fileNamesToUpload = localFileNames.filter(
      localFileName =>
        localFileName === './dist/index.json' ||
        !remoteFileNameSet.has(localFileName.replace('./dist/', ''))
    );
    if (fileNamesToUpload.length === 0) {
      console.log('No local files to upload.');
      return;
    }
    uploadLocalFiles(fileNamesToUpload);
  }
);
