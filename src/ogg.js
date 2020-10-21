'use strict';

const makeGetFormatIndex = require('./make-get-format-index');
const index = require('../dist/ogg.json');

module.exports = makeGetFormatIndex({ index, format: 'ogg' });
