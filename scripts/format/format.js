#!/usr/bin/env node

'use strict';

const pfs = require('fs').promises;
const getOutputJobsFromIndex = require('./get-output-jobs-from-index');
const runOutputJob = require('./run-output-job');
const getIndexFromOutputSamples = require('./get-index-from-output-samples');
const filterExistingSamples = require('./filter-existing-samples');
const sequentialPromises = require('../utils/sequential-promises');
const baseIndex = require('../../samples/index.json');
let prerenderedIndex;
try {
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

pfs
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
        const outputIndex = {
          wav: {},
          mp3: {},
          ogg: {},
        };
        Object.keys(outputIndex).forEach(format => {
          outputIndex[format] = Object.assign(
            {},
            existingOutputIndex[format],
            appendIndex[format]
          );
        });
        return pfs.writeFile(
          './dist/index.json',
          JSON.stringify(outputIndex, null),
          'utf8'
        );
      }
    );
  });
