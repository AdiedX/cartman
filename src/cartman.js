'use strict';

const request = require('request');
const async = require('async');
const fs = require('fs');
const Promise = require('bluebird');

class Cartman {
  /**
   * @function download
   * @description Downloads resources in chunks. Only downloads specified portion of a file
   * @param {String} url - URL of the resource to download
   * @param {String} destination - Path to file to which downloaded resource is written (should include file name)
   * @param {Number} portion - Portion of file in MiB
   * @param {Number} chunkSize - Size of the chunks in MiB
   */
  static async download(url, destination, portion, chunkSize) {
    if (chunkSize > portion) throw new Error('chunk size cannot be bigger than portion size');

    const { MAX_PARALLEL_DOWNLOADS, MEBI_BYTE } = this.getConfig();
    // Ping the resource to get the total size of the file:
    const sizeOfFileInBytes = parseInt(await this.getFileSize(url));

    if (portion * MEBI_BYTE > sizeOfFileInBytes) throw new Error('Portion size cannot be larger than the file itself');

    destination = destination || './cartman-download';
    const portionBytes = portion ? portion * MEBI_BYTE : sizeOfFileInBytes;

    const chunkSizeBytes = chunkSize
      ? Math.floor(chunkSize * MEBI_BYTE)
      : portionBytes >= MEBI_BYTE ? MEBI_BYTE : portionBytes/5;

    const byteRanges = this.calculateByteRanges(portionBytes, chunkSizeBytes);
    const destWriteStream = fs.createWriteStream(destination);

    async.eachSeries(byteRanges, (range, callback) => {
      const options = {
        url: url,
        headers: {
          'Range': range
        }
      };

      request.get(options, (err, response, body) => {
        if (err) throw err;

        destWriteStream.write(body, (err) => {
          if (err) throw err;
          callback();
        });
      });
    }, (err) => {
      if (err) console.log(err);
      destWriteStream.end();
      console.log('Finished downloading');
    });
  }

  /**
   * @function calculateByteRanges
   * @description Calculate the byte ranges for the range header to be used in each HTTP GET call
   * @param {Number} portion
   * @param {Number} chunkSize
   * @return {Array<String>} List of calculated byte ranges
   * Example:
   * [
   *   'bytes=0-101241',
   *   'bytes=101242-202482',
   *   .
   *   .
   *   .
   * ]
   */
  static calculateByteRanges(portionBytes, chunkSizeBytes) {
    const totalRanges = Math.floor(portionBytes/chunkSizeBytes);
    const byteRanges = [];

    let start = 0, stop = chunkSizeBytes, range;

    /**
     * Start from 0 bytes and create byte intervals the following way:
     * Example range of 5:
     * [0, 1 x chunkSize]
     * [1 x chunkSize + 1, 2 x chunkSize]
     * [2 x chunkSize + 1, 3 x chunkSize]
     * [3 x chunkSize + 1, 4 x chunkSize]
     * [4 x chunkSize + 1, totalSizeInBytes]
     */
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
   * @description Pings the resource server for information about the resource size
   * @param {String} url
   * @return {String} Resource size or content-length
   */
  static getFileSize(url) {
    return new Promise((resolve, reject) => {
      request.head(url, (err, response, body) => {
        if (err) reject(err);
        resolve(response.headers['content-length']);
      });
    });
  }

  /**
   * @function getConfig
   * @description Returns the configuration for the downloads
   * @return {Object} Config
   */
  static getConfig() {
    return {
      MAX_PARALLEL_DOWNLOADS: 1000,
      MEBI_BYTE: 1024 * 1024
    };
  }
}

module.exports = Cartman;
