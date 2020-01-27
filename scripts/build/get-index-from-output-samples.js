'use strict';

const getIndexFromOutputSamples = (outputSamples = []) =>
  outputSamples.reduce(
    (outputIndex, { instrumentName, key, filePath, format }) => {
      if (!outputIndex[instrumentName]) {
        outputIndex[instrumentName] = {};
      }
      if (!Number.isNaN(Number.parseInt(key, 10))) {
        if (!outputIndex[instrumentName][format]) {
          outputIndex[instrumentName][format] = [];
        }
      } else if (!outputIndex[instrumentName][format]) {
        outputIndex[instrumentName][format] = {};
      }
      outputIndex[instrumentName][format][key] = filePath;
      return outputIndex;
    },
    {}
  );

module.exports = getIndexFromOutputSamples;
