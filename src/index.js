'use strict';

const getWavSamples = require('./wav');
const getMp3Samples = require('./mp3');
const getOggSamples = require('./ogg');

const getSamplesByFormat = {
  wav: getWavSamples,
  mp3: getMp3Samples,
  ogg: getOggSamples,
};

const getSamples = ({ host, format }) => getSamplesByFormat[format]({ host });

module.exports = getSamples;
