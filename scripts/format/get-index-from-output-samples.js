'use strict';

const getIndexFromOutputSamples = (outputSamples = []) =>
  outputSamples.reduce(
    (outputIndex, { instrumentName, key, filePath, format }) => {
      if (!outputIndex[format]) {
        outputIndex[format] = {};
      }
      if (!Number.isNaN(Number.parseInt(key, 10))) {
        if (!outputIndex[format][instrumentName]) {
          outputIndex[format][instrumentName] = [];
        }
      } else if (!outputIndex[format][instrumentName]) {
        outputIndex[format][instrumentName] = {};
      }
      outputIndex[format][instrumentName][key] = filePath;
      return outputIndex;
    },
    {}
  );

module.exports = getIndexFromOutputSamples;
