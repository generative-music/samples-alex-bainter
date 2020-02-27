#!/usr/bin/env node

'use strict';

const pfs = require('fs').promises;
const getOutputJobsFromIndex = require('./get-output-jobs-from-index');
const runOutputJob = require('./run-output-job');
const getIndexFromOutputSamples = require('./get-index-from-output-samples');
const filterExistingSamples = require('./filter-existing-samples');
const sequentialPromises = require('../utils/sequential-promises');
const inputIndex = require('../../samples/index.json');

const outputIndexPath = './dist/index.json';

const outputJobs = getOutputJobsFromIndex(inputIndex, ['wav', 'mp3', 'ogg']);

pfs
  .readFile(outputIndexPath)
  .then(
    data => filterExistingSamples(outputJobs, JSON.parse(data)),
    () => outputJobs
  )
  .then(filteredOutputJobs => {
    if (filteredOutputJobs.length === 0) {
      console.log('No samples to build.');
      return;
    }
    const outputFns = filteredOutputJobs.map(job => () => runOutputJob(job));
    sequentialPromises(outputFns, 'Creating Samples', 'samples created').then(
      outputSamples => {
        const outputIndex = getIndexFromOutputSamples(outputSamples);
        return pfs.writeFile(
          './dist/index.json',
          JSON.stringify(outputIndex, null),
          'utf8'
        );
      }
    );
  });
