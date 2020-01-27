'use strict';

const { SingleBar, Presets } = require('cli-progress');

const sequentialPromises = (promiseFns, task = 'progress', unit) => {
  const barOptions = unit
    ? {
        format: `${task} {bar} {percentage}% | ETA: {eta}s | {value}/{total} ${unit}`,
      }
    : {};
  const progressBar = new SingleBar(barOptions, Presets.shades_classic);
  progressBar.start(promiseFns.length, 0);
  return promiseFns
    .reduce(
      (lastPromise, nextFn) =>
        lastPromise.then(allResults =>
          nextFn().then(results => {
            progressBar.increment();
            return allResults.concat(results);
          })
        ),
      Promise.resolve([])
    )
    .then(results => {
      progressBar.stop();
      return results;
    });
};

module.exports = sequentialPromises;
