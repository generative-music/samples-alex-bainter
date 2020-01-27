#!/usr/bin/env node

'use strict';

const pfs = require('fs').promises;
const { SingleBar } = require('cli-progress');
const getOutputJobsFromIndex = require('./get-output-jobs-from-index');
const runOutputJob = require('./run-output-job');
const inputIndex = require('../../samples/index.json');
const getIndexFromOutputSamples = require('./get-index-from-output-samples');

const outputJobs = getOutputJobsFromIndex(inputIndex, ['wav', 'mp3', 'ogg']);
const outputFns = outputJobs.map(job => () => runOutputJob(job));

const progressBar = new SingleBar();
progressBar.start(outputFns.length, 0);

outputFns
  .reduce(
    (lastPromise, nextFn) =>
      lastPromise.then(allResults =>
        nextFn().then(results => {
          progressBar.increment();
          return allResults.concat(results);
        })
      ),
    Promise.resolve([])
  )
  .then(outputSamples => {
    progressBar.stop();
    const outputIndex = getIndexFromOutputSamples(outputSamples);
    return pfs.writeFile(
      './dist/index.json',
      JSON.stringify(outputIndex, null),
      'utf8'
    );
  });
