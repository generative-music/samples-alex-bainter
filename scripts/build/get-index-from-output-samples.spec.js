'use strict';

/* eslint-env mocha */

const { expect } = require('chai');
const getIndexFromOutputSamples = require('./get-index-from-output-samples');

describe('getIndexFromOutputSamples', () => {
  it('should return an empty object for empty arguments', () => {
    expect(getIndexFromOutputSamples()).to.eql({});
    expect(getIndexFromOutputSamples([])).to.eql({});
  });

  it('should create an array for samples with integer keys', () => {
    const filePath = './test/file/path';
    expect(
      getIndexFromOutputSamples([
        { instrumentName: 'test', key: 0, format: 'format', filePath },
      ])
    ).to.eql({ format: { test: [filePath] } });
  });

  it('should create an object for samples with string keys', () => {
    const filePath = './test/file/path';
    expect(
      getIndexFromOutputSamples([
        { instrumentName: 'test', key: 'A5', format: 'format', filePath },
      ])
    ).to.eql({ format: { test: { A5: filePath } } });
  });
});
