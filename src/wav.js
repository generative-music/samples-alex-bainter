'use strict';

const makeGetFormatIndex = require('./make-get-format-index');
const index = require('../dist/wav.json');

module.exports = makeGetFormatIndex({ index, format: 'wav' });
