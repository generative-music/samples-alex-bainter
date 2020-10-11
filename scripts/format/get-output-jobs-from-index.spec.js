'use strict';

/* eslint-env mocha */

const { expect } = require('chai');
const getOutputJobsFromIndex = require('./get-output-jobs-from-index');
const outputJob = require('./output-job');

describe('getOutputJobsFromIndex', () => {
  it('return an empty array for empty arguments', () => {
    expect(getOutputJobsFromIndex()).to.eql([]);
    expect(getOutputJobsFromIndex({})).to.eql([]);
    expect(getOutputJobsFromIndex({}, [])).to.eql([]);
  });

  it('should return an output job of every format for each instrument', () => {
    const instrument1SampleIndex = { a: 'a.wav', b: 'b.wav' };
    const instrument2SampleIndex = ['1.wav', '2.wav'];
    const inputIndex = {
      instrument1: instrument1SampleIndex,
      instrument2: instrument2SampleIndex,
    };
    const formats = ['format1', 'format2'];
    const sampleDir = 'sample-dir';
    const expectedResult = Reflect.ownKeys(instrument1SampleIndex)
      .reduce(
        (outputJobs, note) =>
          outputJobs.concat(
            formats.map(format =>
              outputJob(
                sampleDir,
                'instrument1',
                note,
                instrument1SampleIndex[note],
                format
              )
            )
          ),
        []
      )
      .concat(
        instrument2SampleIndex.reduce(
          (outputJobs, relativeFilename, i) =>
            outputJobs.concat(
              formats.map(format =>
                outputJob(sampleDir, 'instrument2', i, relativeFilename, format)
              )
            ),
          []
        )
      );
    const result = getOutputJobsFromIndex(inputIndex, formats, sampleDir);
    expect(result).to.have.deep.members(expectedResult);
  });
});
