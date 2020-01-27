'use strict';

const outputJob = require('./output-job');

const getOutputJobsFromSampleIndexArray = (
  sampleIndex,
  instrumentName,
  formats
) =>
  sampleIndex.reduce(
    (outputJobs, relativeFilename, i) =>
      outputJobs.concat(
        formats.map(format =>
          outputJob(instrumentName, i, relativeFilename, format)
        )
      ),
    []
  );

const getOutputJobsFromSampleIndexObject = (
  sampleIndex,
  instrumentName,
  formats
) =>
  Reflect.ownKeys(sampleIndex).reduce(
    (outputJobs, note) =>
      outputJobs.concat(
        formats.map(format =>
          outputJob(instrumentName, note, sampleIndex[note], format)
        )
      ),
    []
  );

const getOutputJobsFromIndex = (inputIndex = {}, formats = []) =>
  Reflect.ownKeys(inputIndex).reduce((outputJobs, instrumentName) => {
    const sampleIndex = inputIndex[instrumentName];
    const getOutputJobs = Array.isArray(sampleIndex)
      ? getOutputJobsFromSampleIndexArray
      : getOutputJobsFromSampleIndexObject;
    return outputJobs.concat(
      getOutputJobs(sampleIndex, instrumentName, formats)
    );
  }, []);

module.exports = getOutputJobsFromIndex;
