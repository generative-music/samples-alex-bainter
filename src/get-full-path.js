'use strict';

const getFullPath = ({ host, instrumentName, format, basename }) =>
  `${[host, instrumentName, format, basename].join('/')}.${format}`;

module.exports = getFullPath;
