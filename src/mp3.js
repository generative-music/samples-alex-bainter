'use strict';

const makeGetFormatIndex = require('./make-get-format-index');
const index = require('../dist/mp3.json');

module.exports = makeGetFormatIndex({ index, format: 'mp3' });
