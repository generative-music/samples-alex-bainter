'use strict';

const pfs = require('fs').promises;
const path = require('path');
const ffmpegInstallation = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const concatStream = require('concat-stream');
const md5 = require('md5');
const outputSample = require('./output-sample');

ffmpeg.setFfmpegPath(ffmpegInstallation.path);

const saveSampleFile = (outputJob, sampleBuffer) => {
  const { format, instrumentName } = outputJob;
  const hash = md5(sampleBuffer);
  const relativeFilename = `${hash}.${format}`;
  const unprefixedOutputPath = `${instrumentName}/${format}/${relativeFilename}`;
  const localPath = `./dist/${unprefixedOutputPath}`;
  return pfs
    .mkdir(path.dirname(localPath), { recursive: true })
    .then(() => pfs.writeFile(localPath, sampleBuffer))
    .then(() => outputSample(outputJob, `./${unprefixedOutputPath}`));
};

const readAndSaveSample = outputJob => {
  const { inputFilePath } = outputJob;
  return pfs
    .readFile(inputFilePath)
    .then(buffer => saveSampleFile(outputJob, buffer));
};

const convertSample = ({ format, inputFilePath }) =>
  new Promise(resolve => {
    ffmpeg(inputFilePath)
      .format(format)
      .outputOptions('-bitexact')
      .pipe(concatStream(resolve), { end: true });
  });

const convertAndSaveSample = outputJob =>
  convertSample(outputJob).then(buffer => saveSampleFile(outputJob, buffer));

const runOutputJob = outputJob => {
  if (
    outputJob.relativeFilename
      .toUpperCase()
      .endsWith(outputJob.format.toUpperCase())
  ) {
    return readAndSaveSample(outputJob);
  }
  return convertAndSaveSample(outputJob);
};

module.exports = runOutputJob;
