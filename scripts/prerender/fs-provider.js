'use strict';

const fs = require('fs');
const path = require('path');
const audioBufferToWav = require('audiobuffer-to-wav');

const { promises: fsp, constants } = fs;

const has = (filepaths = []) => {
  const requiredFilepaths = filepaths.map(filepath =>
    Array.isArray(filepath) ? filepath[1] : filepath
  );
  return Promise.all(
    requiredFilepaths.map(filepath => fsp.access(filepath, constants.R_OK))
  );
};

const bufferToArrayBuffer = buffer =>
  buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

const request = (audioContext, filepaths = []) =>
  Promise.all(
    filepaths.flat().map(filepath =>
      fsp
        .readFile(filepath)
        .then(buffer =>
          audioContext.decodeAudioData(bufferToArrayBuffer(buffer))
        )
        .catch(() => null)
    )
  );

const save = (entries = []) =>
  Promise.all(
    entries.map(([filepath, audioBuffer]) => {
      const dir = path.dirname(filepath);
      const wavData = audioBufferToWav(audioBuffer);
      return fsp
        .mkdir(dir, { recursive: true })
        .then(() => fsp.writeFile(filepath, Buffer.from(wavData)));
    })
  );

module.exports = {
  has,
  request,
  save,
};
