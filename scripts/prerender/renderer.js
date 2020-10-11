'use strict';

const { ipcRenderer } = require('electron');
const Tone = require('tone');
const fsLibrary = require('./fs-library');

ipcRenderer.once('begin', async (event, piecePath) => {
  console.log('received begin event');
  const activate = require(piecePath);
  console.log(`activating ${piecePath}`);
  await activate({
    context: Tone.context,
    sampleLibrary: fsLibrary,
    destination: new Tone.Gain(0),
    onProgress: val => {
      console.log(`${Math.round(val * 100)}%`);
    },
  });
  console.log('activated');
  fsLibrary.whenSaved().then(() => {
    console.log('saved');
    ipcRenderer.send('complete');
  });
});

console.log('sending ready event');
ipcRenderer.send('ready');
