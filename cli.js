#!/usr/bin/env node

'use strict'

const fetcher = require('./');
const minimist = require('minimist');
const extend = require('extend');
const fs = require('fs');
const os = require('os');
const async = require('async');

let opts = minimist(process.argv.slice(2))

if (opts['strict-ssl'] === false) {
  opts.strictSSL = false
}

function flatten_configuration(cfg) {
  let conf = extend(true, {}, cfg);
  let env = conf.ENV;
  if (env) {
    // mix in platform specifics
    if (env[os.platform()]) {
      conf = extend(true, conf, env[os.platform()])
    }

    // then apply environment setup
    const node_env = process.env.NODE_ENV || "development";
    if (env[node_env]) {
      conf = extend(true, conf, env[node_env]);
    }

    delete conf.ENV
  }
  return conf
}

function make_downloader(pkgs, name) {
  const opts = pkgs[name];
  if (!opts.filename) {
    opts.filename = name
  }
  return (cb) => fetcher(opts, (targetFiles, opts) => {
    console.log('Downloaded and unzip of ' + opts.filename +
                ' complete: \n - ' + opts.targetDir + '/'
                + targetFiles.join(',\n - ' + opts.targetDir + '/') + "\n\n\n");
    cb(0, targetFiles)
  })
}

if (opts.package) {
	const packages = JSON.parse(fs.readFileSync(opts.package, 'utf8'));
  if (!packages.download_deps) {
    console.log("No 'download_deps' found in configuration " + opts.package);
    process.exit(1)
  }

  const pkgs = flatten_configuration(packages.download_deps);

  async.parallelLimit(
    Object.getOwnPropertyNames(pkgs)
      .map((name) => make_downloader(pkgs, name)), 4)

} else {
  if (!opts.filename) {
    console.log("You must specify the --version and --filename")
  }
  fetcher(opts, (targetFiles, opts) => {
    console.log('Downloaded and unzip of ' + opts.filename + ' complete: \n - ' + opts.targetDir + '/'
    			  + targetFiles.join(',\n - ' + opts.targetDir + '/'))
    process.exit(0)
  })
}
