/* eslint-env mocha*/

const { expect } = require('chai');
const { noCallThru } = require('proxyquire');

const proxyquire = noCallThru();

const mockSamplesByFormat = {
  format1: {
    dep1: {
      url1: 'format1/dep1/url1',
      url2: 'format1/dep1/url2',
    },
    dep2: ['format1/dep2/url1', 'format1/dep2/url2'],
  },
  format2: {
    dep1: {
      url1: 'format2/dep1/url1',
      url2: 'format2/dep1/url2',
    },
    dep2: ['format2/dep2/url1', 'format2/dep2/url2'],
  },
};

const getSamplesByFormat = proxyquire('./index', {
  '../dist/index.json': mockSamplesByFormat,
});

describe('getSamplesByFormat', () => {
  it('should just return the samples indicies if no host is provided', () => {
    expect(getSamplesByFormat()).to.eql(mockSamplesByFormat);
  });

  beforeEach(() => {
    delete process.env.SAMPLE_FILE_HOST;
  });

  it('should prepend the host argument to every url', () => {
    const host = 'HOST';
    const outputSamplesByFormat = getSamplesByFormat(host);
    Reflect.ownKeys(mockSamplesByFormat).forEach(format => {
      const sampleIndex = mockSamplesByFormat[format];
      const outputIndex = outputSamplesByFormat[format];
      Reflect.ownKeys(sampleIndex).forEach(sampleName => {
        const samples = sampleIndex[sampleName];
        const outputSamples = outputIndex[sampleName];
        if (Array.isArray(samples)) {
          expect(outputSamples).to.have.ordered.members(
            samples.map(url => `${host}/${url}`)
          );
        } else {
          Reflect.ownKeys(samples).forEach(key => {
            expect(outputSamples[key]).to.equal(`${host}/${samples[key]}`);
          });
        }
      });
    });
  });

  it('should prepend the SAMPLE_FILE_HOST environment variable to every url', () => {
    const host = 'HOST';
    process.env.SAMPLE_FILE_HOST = host;
    const outputSamplesByFormat = getSamplesByFormat();
    Reflect.ownKeys(mockSamplesByFormat).forEach(format => {
      const sampleIndex = mockSamplesByFormat[format];
      const outputIndex = outputSamplesByFormat[format];
      Reflect.ownKeys(sampleIndex).forEach(sampleName => {
        const samples = sampleIndex[sampleName];
        const outputSamples = outputIndex[sampleName];
        if (Array.isArray(samples)) {
          expect(outputSamples).to.have.ordered.members(
            samples.map(url => `${host}/${url}`)
          );
        } else {
          Reflect.ownKeys(samples).forEach(key => {
            expect(outputSamples[key]).to.equal(`${host}/${samples[key]}`);
          });
        }
      });
    });
  });

  it('should prepend the host argument to every url even if the SAMPLE_FILE_HOST environment variable had a value', () => {
    const host = 'HOST';
    process.env.SAMPLE_FILE_HOST = `${host}::ENV_VAR`;
    const outputSamplesByFormat = getSamplesByFormat(host);
    Reflect.ownKeys(mockSamplesByFormat).forEach(format => {
      const sampleIndex = mockSamplesByFormat[format];
      const outputIndex = outputSamplesByFormat[format];
      Reflect.ownKeys(sampleIndex).forEach(sampleName => {
        const samples = sampleIndex[sampleName];
        const outputSamples = outputIndex[sampleName];
        if (Array.isArray(samples)) {
          expect(outputSamples).to.have.ordered.members(
            samples.map(url => `${host}/${url}`)
          );
        } else {
          Reflect.ownKeys(samples).forEach(key => {
            expect(outputSamples[key]).to.equal(`${host}/${samples[key]}`);
          });
        }
      });
    });
  });
});
