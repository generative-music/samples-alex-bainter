'use strict';

const glob = require('./glob-promise');

const getLocalDistFileNames = () => glob('./dist/**/*.*');

module.exports = getLocalDistFileNames;
