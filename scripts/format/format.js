#!/usr/bin/env node

'use strict';

const fsp = require('fs').promises;
const path = require('path');
const getOutputJobsFromIndex = require('./get-output-jobs-from-index');
const runOutputJob = require('./run-output-job');
const getIndexFromOutputSamples = require('./get-index-from-output-samples');
const filterExistingSamples = require('./filter-existing-samples');
const sequentialPromises = require('../utils/sequential-promises');
const baseIndex = require('../../samples/index.json');
let prerenderedIndex;
try {
  //eslint-disable-next-line global-require
  prerenderedIndex = require('../../prerendered-samples/index.json');
} catch (err) {
  console.log('prerendered-samples/index.json not found');
}

const outputIndexPath = './dist/index.json';

const baseOutputJobs = getOutputJobsFromIndex(
  baseIndex,
  ['wav', 'mp3', 'ogg'],
  'samples'
);

const prerenderedOutputJobs = getOutputJobsFromIndex(
  prerenderedIndex,
  ['wav', 'mp3', 'ogg'],
  'prerendered-samples'
);

const outputJobs = baseOutputJobs.concat(prerenderedOutputJobs);

fsp
  .readFile(outputIndexPath, 'utf8')
  .then(
    data => JSON.parse(data),
    () => ({})
  )
  .then(existingOutputIndex => {
    const filteredOutputJobs = filterExistingSamples(
      outputJobs,
      existingOutputIndex
    );
    if (filteredOutputJobs.length === 0) {
      console.log('No samples to build.');
      return;
    }
    const outputFns = filteredOutputJobs.map(job => () => runOutputJob(job));
    sequentialPromises(outputFns, 'Creating Samples', 'samples created').then(
      outputSamples => {
        const appendIndex = getIndexFromOutputSamples(outputSamples);
        const outputIndex = Object.keys(appendIndex).reduce(
          (newOutputIndex, format) => {
            const appendingFormatIndex = appendIndex[format];
            newOutputIndex[format] = Object.keys(appendingFormatIndex).reduce(
              (byInstrumentName, instrumentName) => {
                const collection =
                  newOutputIndex[format][instrumentName] ||
                  appendingFormatIndex[instrumentName];
                byInstrumentName[instrumentName] = Object.assign(
                  collection,
                  newOutputIndex[format][instrumentName],
                  appendingFormatIndex[instrumentName]
                );
                return byInstrumentName;
              },
              newOutputIndex[format]
            );
            return newOutputIndex;
          },
          existingOutputIndex
        );
        const condendsedIndex = Object.keys(outputIndex).reduce(
          (byFormat, format) => {
            const byInstrumentName = outputIndex[format];
            byFormat[format] = Object.keys(byInstrumentName).reduce(
              (o, instrumentName) => {
                const sampleFiles = byInstrumentName[instrumentName];
                if (Array.isArray(sampleFiles)) {
                  o[instrumentName] = sampleFiles.map(filePath =>
                    path.basename(filePath, `.${format}`)
                  );
                } else if (typeof sampleFiles === 'object') {
                  o[instrumentName] = Object.keys(sampleFiles).reduce(
                    (byKey, key) => {
                      const filePath = sampleFiles[key];
                      byKey[key] = path.basename(filePath, `.${format}`);
                      return byKey;
                    },
                    {}
                  );
                }
                return o;
              },
              {}
            );
            return byFormat;
          },
          {}
        );
        const indexFiles = Object.keys(condendsedIndex)
          .map(format => [`./dist/${format}.json`, condendsedIndex[format]])
          .concat([['./dist/index.json', outputIndex]]);
        return Promise.all(
          indexFiles
            .filter(([, data]) => Object.keys(data) !== 0)
            .map(([filename, data]) =>
              fsp.writeFile(filename, JSON.stringify(data), 'utf8')
            )
        );
      }
    );
  });
