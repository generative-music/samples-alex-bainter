'use strict';

const getFullPath = require('./get-full-path');

const makeGetFormatIndex = ({ index, format }) => ({ host: hostArg }) => {
  const host = hostArg || process.env.SAMPLE_FILE_HOST;
  return Object.keys(index).reduce((transformedIndex, instrumentName) => {
    const instrumentBasenames = index[instrumentName];
    if (Array.isArray(instrumentBasenames)) {
      transformedIndex[instrumentName] = instrumentBasenames.map(basename =>
        getFullPath({ host, instrumentName, basename, format })
      );
      return transformedIndex;
    }
    if (
      typeof instrumentBasenames === 'object' &&
      instrumentBasenames !== null
    ) {
      const keys = Object.keys(instrumentBasenames);
      transformedIndex[instrumentName] = keys.reduce((o, key) => {
        o[key] = getFullPath({
          host,
          instrumentName,
          basename: instrumentBasenames[key],
          format,
        });
        return o;
      }, {});
    }
    return transformedIndex;
  }, {});
};

module.exports = makeGetFormatIndex;
