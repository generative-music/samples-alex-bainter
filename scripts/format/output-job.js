'use strict';

const outputJob = (
  sampleDir,
  instrumentName,
  key,
  relativeFilename,
  format
) => ({
  instrumentName,
  key,
  relativeFilename,
  format,
  inputFilePath: `./${sampleDir}/${instrumentName}/${relativeFilename}`,
});

module.exports = outputJob;
