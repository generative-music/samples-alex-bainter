'use strict';

const path = require('path');
const fsp = require('fs').promises;
const { ipcRenderer } = require('electron');
const fsProvider = require('./fs-provider');
const baseIndex = require('../../samples/index.json');

const outputIndexPromise = fsp
  .readFile('./prerendered-samples/index.json')
  .then(
    data => JSON.parse(data),
    () => ({})
  );

const getSamplePath = (sampleDir, instrumentName, relativeFilename) =>
  path.join(__dirname, '../..', sampleDir, instrumentName, relativeFilename);

const request = (audioContext, instrumentNames = []) =>
  outputIndexPromise.then(outputIndex => {
    const prerenderedInstruments = instrumentNames
      .filter(
        instrumentName =>
          Array.isArray(instrumentName) && outputIndex[instrumentName[0]]
      )
      .map(([instrumentName]) => [
        'prerendered-samples',
        instrumentName,
        outputIndex[instrumentName],
      ]);
    const baseInstruments = instrumentNames
      .map(instrumentName =>
        Array.isArray(instrumentName) ? instrumentName[1] : instrumentName
      )
      .filter(instrumentName => Boolean(baseIndex[instrumentName]))
      .map(instrumentName => [
        'samples',
        instrumentName,
        baseIndex[instrumentName],
      ]);
    const instruments = prerenderedInstruments.concat(baseInstruments);
    return Promise.all(
      instruments.map(([sampleDir, instrumentName, samples]) => {
        if (Array.isArray(samples)) {
          return fsProvider.request(
            audioContext,
            samples.map(filename =>
              getSamplePath(sampleDir, instrumentName, filename)
            )
          );
        }
        const keys = Object.keys(samples);
        return fsProvider
          .request(
            audioContext,
            Object.values(samples).map(filename =>
              getSamplePath(sampleDir, instrumentName, filename)
            )
          )
          .then(audioBuffers =>
            audioBuffers.reduce((o, audioBuffer, i) => {
              o[keys[i]] = audioBuffer;
              return o;
            }, {})
          );
      })
    ).then(instrumentSamples =>
      instrumentSamples.reduce((o, samples, i) => {
        const [, instrumentName] = instruments[i];
        o[instrumentName] = samples;
        return o;
      }, {})
    );
  });

const savePromises = [];

const getDestinationFilenameForKey = key => {
  if (Number.isInteger(key)) {
    return `${key + 1}.wav`;
  }
  return `${key.replace('#', 'sharp').toLowerCase()}.wav`;
};

const getDestinationSamplePath = (instrumentName, key) =>
  path.join(
    __dirname,
    '../../prerendered-samples',
    instrumentName,
    getDestinationFilenameForKey(key)
  );

const save = (entries = []) => {
  const keyValuePairs = entries
    .map(([instrumentName, samples]) => {
      if (Array.isArray(samples)) {
        ipcRenderer.send('saved-samples', {
          [instrumentName]: samples.map((_, i) =>
            getDestinationFilenameForKey(i)
          ),
        });
        return samples.map((audioBuffer, i) => [
          getDestinationSamplePath(instrumentName, i),
          audioBuffer,
        ]);
      }
      const keys = Object.keys(samples);
      ipcRenderer.send('saved-samples', {
        [instrumentName]: keys.reduce((o, key) => {
          o[key] = getDestinationFilenameForKey(key);
          return o;
        }, {}),
      });
      return keys.map(key => {
        const audioBuffer = samples[key];
        return [getDestinationSamplePath(instrumentName, key), audioBuffer];
      });
    })
    .flat();

  const promise = fsProvider.save(keyValuePairs);
  savePromises.push(promise);
  return savePromises;
};

module.exports = {
  request,
  save,
  whenSaved: () =>
    Promise.all(savePromises).then(() => {
      savePromises.splice(0, savePromises.length);
    }),
};
