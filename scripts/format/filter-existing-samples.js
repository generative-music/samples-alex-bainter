'use strict';

const filterExistingSamples = (outputJobs, previousOutputIndex = {}) =>
  outputJobs.filter(
    ({ instrumentName, key, format }) =>
      !previousOutputIndex[format] ||
      !previousOutputIndex[format][instrumentName] ||
      !previousOutputIndex[format][instrumentName][key]
  );

module.exports = filterExistingSamples;
