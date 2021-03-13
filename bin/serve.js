#!/usr/bin/env node

'use strict';

const startServer = require('../lib/start-server');
startServer().then(() => {
  console.log('Server is listening...');
});
