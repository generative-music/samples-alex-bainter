#!/usr/bin/env node

'use strict';

const path = require('path');
const fsp = require('fs').promises;
const glob = require('glob');
const outputIndex = require('../../dist/index.json');

glob('./dist/**/*.@(wav|ogg|mp3)', (err, files) => {
  if (err) {
    throw err;
  }
  const indexedFileSets = Object.keys(outputIndex).reduce(
    (byInstrumentName, instrumentName) => {
      const basenamesByFormat = Object.keys(outputIndex[instrumentName]).reduce(
        (byFormat, format) => {
          const basenames = outputIndex[instrumentName][format];
          const basenamesArray = Array.isArray(basenames)
            ? basenames
            : Object.values(basenames);
          byFormat.set(format, new Set(basenamesArray));
          return byFormat;
        },
        new Map()
      );
      byInstrumentName.set(instrumentName, basenamesByFormat);
      return byInstrumentName;
    },
    new Map()
  );

  const orphans = files.filter(filename => {
    const [instrumentName, format, basenameWithExtension] = filename
      .split('/')
      .slice(2);
    const basename = path.basename(
      basenameWithExtension,
      path.extname(basenameWithExtension)
    );
    return !(
      indexedFileSets.has(instrumentName) &&
      indexedFileSets.get(instrumentName).has(format) &&
      indexedFileSets
        .get(instrumentName)
        .get(format)
        .has(basename)
    );
  });

  Promise.all(orphans.map(fsp.unlink)).then(() => {
    console.log(`Removed ${orphans.length} files`);
  });
});
