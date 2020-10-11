'use strict';

const fsp = require('fs').promises;
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const sequentialPromises = require('../utils/sequential-promises');

app.on('window-all-closed', e => e.preventDefault());

const packageDir = path.join(
  __dirname,
  '../../node_modules/@generative-music/'
);

const prerenderedIndex = {};

ipcMain.on('saved-samples', (event, sampleIndex) => {
  Object.assign(prerenderedIndex, sampleIndex);
});

const prerender = packageName =>
  new Promise(resolve => {
    const win = new BrowserWindow({
      width: 800,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    ipcMain.once('ready', event => {
      event.reply('begin', packageName);
    });

    ipcMain.once('complete', () => {
      win.close();
      resolve();
    });

    win.loadFile('./index.html');
    win.webContents.openDevTools();
  });

Promise.all([fsp.readdir(packageDir), app.whenReady()])
  .then(([dirnames]) => {
    const queue = dirnames
      .filter(dirname => dirname.startsWith('piece-'))
      .map(dirname => () => prerender(`@generative-music/${dirname}`));
    return sequentialPromises(queue, 'Prerendering', 'pieces prerendered');
  })
  .then(() => {
    const indexFilepath = path.join(
      __dirname,
      '../../prerendered-samples/index.json'
    );
    return fsp
      .readFile(indexFilepath)
      .then(
        data => JSON.parse(data),
        () => ({})
      )
      .then(existingIndexFile =>
        fsp.writeFile(
          indexFilepath,
          JSON.stringify(Object.assign({}, existingIndexFile, prerenderedIndex))
        )
      );
  })
  .then(() => {
    process.exit(0);
  });
