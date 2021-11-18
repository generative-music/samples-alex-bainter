#!/usr/bin/env node

'use strict';
const { promises: fsp } = require('fs');
const path = require('path');

const getOutputIndex = format =>
  fsp
    .readFile(path.join(__dirname, `../../dist/${format.toLowerCase()}.json`))
    .then(data => JSON.parse(data))
    .catch(() => ({}));

const transformIndex = format => index =>
  Object.keys(index).reduce((newIndex, instrumentName) => {
    const sampleFiles = index[instrumentName];
    if (Array.isArray(index[instrumentName])) {
      newIndex[instrumentName] = sampleFiles.map(
        relativeFilename =>
          `./${instrumentName}/${format}/${relativeFilename}.${format}`
      );
    } else if (typeof sampleFiles === 'object') {
      newIndex[instrumentName] = Object.keys(sampleFiles).reduce((o, note) => {
        const relativeFilename = sampleFiles[note];
        o[note] = `./${instrumentName}/${format}/${relativeFilename}.${format}`;
        return o;
      }, {});
    }
    return newIndex;
  }, {});

Promise.all(
  ['wav', 'ogg', 'mp3'].map(format =>
    getOutputIndex(format)
      .then(transformIndex(format))
      .then(newIndex => [format, newIndex])
  )
).then(formatIndexTuples => {
  const fullIndex = formatIndexTuples.reduce((o, [format, index]) => {
    o[format] = index;
    return o;
  }, {});
  return fsp.writeFile(
    path.join(__dirname, '../../dist/index.json'),
    JSON.stringify(fullIndex),
    'utf8'
  );
});
