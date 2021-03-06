#!/usr/bin/env node

'use strict';

const fsp = require('fs').promises;
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
  .readFile(outputIndexPath)
  .then(
    data => JSON.parse(data),
    () => outputJobs
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
          (byInstrumentName, instrumentName) => {
            const existingInstrumentIndex = existingOutputIndex[instrumentName]
              ? existingOutputIndex[instrumentName]
              : {};
            const formats = Array.from(
              new Set(
                Object.keys(existingInstrumentIndex).concat(
                  Object.keys(appendIndex[instrumentName])
                )
              )
            );
            byInstrumentName[instrumentName] = formats.reduce(
              (byFormat, format) => {
                byFormat[format] = Object.assign(
                  {},
                  existingInstrumentIndex[format],
                  appendIndex[format]
                );
                return byFormat;
              },
              {}
            );
            return byInstrumentName;
          },
          {}
        );
        const singleFormatIndicies = Object.keys(outputIndex).reduce(
          (byFormat, instrumentName) => {
            const instrumentFilesByFormat = outputIndex[instrumentName];
            Object.keys(instrumentFilesByFormat).forEach(format => {
              if (!byFormat[format]) {
                byFormat[format] = {};
              }
              byFormat[format][instrumentName] =
                instrumentFilesByFormat[format];
            });
            return byFormat;
          },
          {}
        );
        const indexFiles = Object.keys(singleFormatIndicies)
          .map(format => [
            `./dist/${format}.json`,
            singleFormatIndicies[format],
          ])
          .concat([['./dist/index.json', outputIndex]]);
        return Promise.all(
          indexFiles.map((filename, data) =>
            fsp.writeFile(filename, JSON.stringify(data), 'utf8')
          )
        );
      }
    );
  });
