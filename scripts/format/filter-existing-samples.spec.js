'use strict';

/*eslint-env mocha */

const { expect } = require('chai');
const filterExistingSamples = require('./filter-existing-samples');
const outputJob = require('./output-job');

describe('filterExistingSamples', () => {
  it('should return the given array if no output index was provided', () => {
    const outputJobs = [outputJob('test', 'key', 'filename', 'format')];
    expect(filterExistingSamples(outputJobs)).to.have.members(outputJobs);
    expect(filterExistingSamples(outputJobs, {})).to.have.members(outputJobs);
  });

  it('should filter output jobs if a matching file for instrument, format, and key is found', () => {
    const outputJobs = [
      outputJob('test1', 'key1', 'filename1', 'format1'),
      outputJob('test2', 0, 'filename2', 'format2'),
    ];
    expect(
      filterExistingSamples(outputJobs, {
        format1: { test1: { key1: 'something' }, test2: ['something'] },
        format2: { test1: { key1: 'something' }, test2: ['something'] },
      })
    ).to.eql([]);
  });
});
