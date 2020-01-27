'use strict';

const outputJob = (instrumentName, key, relativeFilename, format) => ({
  instrumentName,
  key,
  relativeFilename,
  format,
  inputFilePath: `./samples/${instrumentName}/${relativeFilename}`,
});

module.exports = outputJob;
