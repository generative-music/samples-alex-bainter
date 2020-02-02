#!/usr/bin/env node

'use strict';

const getRemoteFileNames = require('../utils/get-remote-file-names');
const getLocalDistFileNames = require('../utils/get-local-dist-file-names');
const downloadRemoteFiles = require('./download-remote-files');

Promise.all([getLocalDistFileNames(), getRemoteFileNames()]).then(
  ([localFileNames, remoteFileNames]) => {
    const localFileNamesSet = new Set(localFileNames);
    const fileNamesToDownload = remoteFileNames.filter(
      remoteFileName => !localFileNamesSet.has(`./dist/${remoteFileName}`)
    );
    if (fileNamesToDownload.length === 0) {
      console.log('No remote files to download.');
      return;
    }
    downloadRemoteFiles(fileNamesToDownload);
  }
);
