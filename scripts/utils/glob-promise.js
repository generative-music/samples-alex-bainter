'use strict';

const glob = require('glob');

const globPromise = (pattern, opts) =>
  new Promise((resolve, reject) => {
    glob(pattern, opts, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

module.exports = globPromise;
