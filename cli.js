#!/usr/bin/env node

'use strict'

const fetcher = require('./');
const minimist = require('minimist');

let opts = minimist(process.argv.slice(2))

if (opts['strict-ssl'] === false) {
  opts.strictSSL = false
}

fetcher(opts, (targetFiles, opts) => {
  console.log('Downloaded and unzip complete: \n - ' + opts.targetDir + '/'
  			  + targetFiles.join(',\n - ' + opts.targetDir + '/'))
  process.exit(0)
})
