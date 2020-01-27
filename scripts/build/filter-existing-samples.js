'use strict';

const filterExistingSamples = (outputJobs, previousOutputIndex = {}) =>
  outputJobs.filter(
    ({ instrumentName, key, format }) =>
      !previousOutputIndex[instrumentName] ||
      !previousOutputIndex[instrumentName][format] ||
      !previousOutputIndex[instrumentName][format][key]
  );

module.exports = filterExistingSamples;
