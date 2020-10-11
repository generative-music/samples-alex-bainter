'use strict';

const outputJob = require('./output-job');

const getOutputJobsFromSampleIndexArray = (
  sampleIndex,
  sampleDir,
  instrumentName,
  formats
) =>
  sampleIndex.reduce(
    (outputJobs, relativeFilename, i) =>
      outputJobs.concat(
        formats.map(format =>
          outputJob(sampleDir, instrumentName, i, relativeFilename, format)
        )
      ),
    []
  );

const getOutputJobsFromSampleIndexObject = (
  sampleIndex,
  sampleDir,
  instrumentName,
  formats
) =>
  Reflect.ownKeys(sampleIndex).reduce(
    (outputJobs, note) =>
      outputJobs.concat(
        formats.map(format =>
          outputJob(sampleDir, instrumentName, note, sampleIndex[note], format)
        )
      ),
    []
  );

const getOutputJobsFromIndex = (
  inputIndex = {},
  formats = [],
  sampleDir = 'samples'
) =>
  Reflect.ownKeys(inputIndex).reduce((outputJobs, instrumentName) => {
    const sampleIndex = inputIndex[instrumentName];
    const getOutputJobs = Array.isArray(sampleIndex)
      ? getOutputJobsFromSampleIndexArray
      : getOutputJobsFromSampleIndexObject;
    return outputJobs.concat(
      getOutputJobs(sampleIndex, sampleDir, instrumentName, formats)
    );
  }, []);

module.exports = getOutputJobsFromIndex;
