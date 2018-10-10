#!/usr/bin/env node

'use strict';

const cartman = require('./cartman');
const commander = require('commander');

commander
  .version('0.0.1')
  .description('Cartman downloader likes to consume large files!');

commander
  .command('download <url> [destination] [portionOfFileToDownload] [chunkSize]')
  .alias('d')
  .description('Download a file')
  .action((url, destination, portionOfFileToDownload, chunkSize) => {
    console.log(`Downloading from ${url}`);
    cartman.download(url, destination, portionOfFileToDownload, chunkSize);
  });

commander.parse(process.argv);
