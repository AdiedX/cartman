'use strict';

const request = require('request');
const async = require('async');
const fs = require('fs');
const Promise = require('bluebird');

class Cartman {
  /**
   * @function download
   * @param {*} url
   * @param {*} destination
   * @param {*} portion
   * @param {*} chunkSize
   */
  static async download(url, destination, portion, chunkSize) {
    const MAX_PARALLEL_DOWNLOADS = this.getMaxParallelDownloads();
    const sizeOfFileInBytes = parseInt(await this.getFileSize(url));

    let portionBytes;
    if (!portion) {
      portionBytes = sizeOfFileInBytes;
    } else {
      portionBytes = portion * 1024 * 1024;
    }

    let chunkSizeBytes;
    if (!chunkSize) {
      if (portionBytes >= 1024 * 1024) {
        chunkSizeBytes = 1024 * 1024;
      } else {
        chunkSizeBytes = portionBytes/5;
      }
    } else {
      chunkSizeBytes = chunkSize * 1024 * 1024;
    }

    const byteRanges = this.calculateByteRanges(portionBytes, chunkSizeBytes);
    const destWriteStream = fs.createWriteStream(destination);

    let options;
    async.eachLimit(byteRanges, MAX_PARALLEL_DOWNLOADS, (range, callback) => {
      options = {
        url: url,
        headers: {
          'Range': range
        }
      };
      request.get(options).pipe(destWriteStream);
      callback();
    }, (err) => {
      if (err) {
        console.log(err);
      }
      console.log('Finished downloading');
    });
  }

  /**
   * @function calculateByteRanges
   * @param {*} portion
   * @param {*} chunkSize
   */
  static calculateByteRanges(portionBytes, chunkSizeBytes) {
    const totalRanges = Math.floor(portionBytes/chunkSizeBytes);
    const byteRanges = [];

    let start = 0, stop = chunkSizeBytes, range;

    for (let i = 0; i < totalRanges; i++) {
      if (portionBytes - stop > 0 && portionBytes - stop < chunkSizeBytes) {
        stop += (portionBytes - stop);
        range = `${start}-${stop}`;
        byteRanges.push(`bytes=${range}`);
      } else {
        range = `${start}-${stop}`;
        byteRanges.push(`bytes=${range}`);
        start = stop + 1;
        stop += chunkSizeBytes;
      }
    }

    return byteRanges;
  }

  /**
   * @function getFileSize
   * @param {*} url
   */
  static getFileSize(url) {
    return new Promise((resolve, reject) => {
      request.head(url, (err, response, body) => {
        if (err) {
          reject(err);
        }
        resolve(response.headers['content-length']);
      });
    });
  }

  static getMaxParallelDownloads() {
    return 1000;
  }

  static directDownload(url, destination) {
    const destWriteStream = fs.createWriteStream(destination);
    request.get(url).pipe(destWriteStream);
  }
}

Cartman.download("http://norvig.com/big.txt", "./download-file-each", 0.5, 0.1);
// Cartman.directDownload("http://norvig.com/big.txt", "./download-file-direct");
