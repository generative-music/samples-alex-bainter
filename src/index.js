const samplesByFormat = require('./dist/index.json');

const HOST_ENV_VAR_NAME = 'SAMPLE_FILE_HOST';

function transformUrls(transform, sampleIndex) {
  return Object.assign(
    {},
    Reflect.ownKeys(sampleIndex).reduce((prefixedIndex, sampleName) => {
      const samples = sampleIndex[sampleName];
      prefixedIndex[sampleName] = Array.isArray(samples)
        ? samples.map(url => transform(url))
        : Reflect.ownKeys(samples).reduce((prefixedSamples, key) => {
            prefixedSamples[key] = transform(samples[key]);
            return prefixedSamples;
          }, {});
      return prefixedIndex;
    }, {})
  );
}

function getSamplesByFormat(sampleFileHostArg) {
  const host =
    sampleFileHostArg ||
    (process && process.env && process.env[HOST_ENV_VAR_NAME]);

  if (!host) {
    return samplesByFormat;
  }
  const prefixUrl = url => `${host}/${url}`;

  return Reflect.ownKeys(samplesByFormat).reduce(
    (prefixedSamplesByFormat, format) => {
      prefixedSamplesByFormat[format] = transformUrls(
        prefixUrl,
        samplesByFormat[format]
      );
      return prefixedSamplesByFormat;
    },
    {}
  );
}

module.exports = getSamplesByFormat;
