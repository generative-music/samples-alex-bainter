#!/usr/bin/env node

'use strict';

const fsp = require('fs').promises;
const glob = require('glob');
const outputIndex = require('../../dist/index.json');

glob('./dist/**/*.@(wav|ogg|mp3)', (err, files) => {
  if (err) {
    throw err;
  }
  const indexedFileSets = Object.keys(outputIndex).reduce(
    (byFormat, format) => {
      const basenamesByInstrument = Object.keys(outputIndex[format]).reduce(
        (byInstrument, instrumentName) => {
          const filepaths = outputIndex[format][instrumentName];
          const filepathsArray = Array.isArray(filepaths)
            ? filepaths
            : Object.values(filepaths);
          const basenames = filepathsArray.map(filepath =>
            filepath.slice(filepath.lastIndexOf('/') + 1)
          );
          byInstrument.set(instrumentName, new Set(basenames));
          return byInstrument;
        },
        new Map()
      );
      byFormat.set(format, basenamesByInstrument);
      return byFormat;
    },
    new Map()
  );

  const orphans = files.filter(filename => {
    const [instrumentName, format, basename] = filename.split('/').slice(2);
    return (
      indexedFileSets.has(format) &&
      indexedFileSets.get(format).has(instrumentName) &&
      indexedFileSets
        .get(format)
        .get(instrumentName)
        .has(basename)
    );
  });

  Promise.all(orphans.map(fsp.unlink)).then(() => {
    console.log(`Removed ${orphans.length} files`);
  });
});
