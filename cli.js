#!/usr/bin/env node

'use strict'

const fetcher = require('./');
const minimist = require('minimist');
const extend = require('extend');
const fs = require('fs');
const os = require('os');
const async = require('async');
const mkdirp = require('mkdirp');


/**
 * makes the targetDir (recursively) and runs a cb
 */
function createTargetDir( targetDir, cb) {
  mkdirp.sync(targetDir, function (err) {
    if (err) return cb(err);
  });
}

let opts = minimist(process.argv.slice(2))

if (opts['strict-ssl'] === false) {
  opts.strictSSL = false
}

function flatten_configuration(cfg) {
  const node_env = process.env.NODE_ENV || "development";
  let conf = extend(true, {}, cfg);
  let env = conf.ENV;

  if (env) {
    Object.keys(env).forEach((envValue) => {
      Object.keys(env[envValue]).forEach((fileName) => {
        Object.keys(env[envValue][fileName]).forEach((prop) => {
          if (prop === "override" && !env[envValue][fileName][prop]) {
            // mix in platform specifics
            if (env[os.platform()]) {
              env[envValue][fileName] = extend(true, env[envValue][fileName], env[os.platform()][fileName])
            }

            // then apply environment setup
            if (env[os.platform()] && env[os.platform()].ENV && env[os.platform()].ENV[node_env]) {
              env[envValue][fileName] = extend(true, env[envValue][fileName], env[os.platform()].ENV[node_env][fileName]);
            }
            if (env[node_env]) {
              env[envValue][fileName] = extend(true, env[envValue][fileName], env[node_env][fileName]);
            }
            env[envValue][`${fileName}_${envValue}`] = extend(true, {}, conf[fileName], env[envValue][fileName]);
            delete env[envValue][fileName];
          }
        });
      });
    });

    // mix in platform specifics
    if (env[os.platform()]) {
      conf = extend(true, conf, env[os.platform()])
    }

    // then apply environment setup
    if (env[os.platform()] && env[os.platform()].ENV && env[os.platform()].ENV[node_env]) {
      conf = extend(true, conf, env[os.platform()].ENV[node_env]);
    }
    if (env[node_env]) {
      conf = extend(true, conf, env[node_env]);
    }

    delete conf.ENV;
    Object.keys(conf).forEach((name) => {
      Object.keys(conf[name]).forEach((prop) => {
        if (prop === "disabled" && conf[name][prop]) {
          delete conf[name];
        }
      });
    });
  }
  return conf
}

function make_downloader(pkgs, name) {
  const opts = pkgs[name];
  const targetDir = opts.targetDir;

  if (!opts.filename) {
    opts.filename = name
  }

  // make targetDir if it doesnt exist.
  if (!fs.existsSync(targetDir)) {
    createTargetDir(targetDir);
  }

  return (cb) => fetcher(opts, (targetFiles, opts) => {
    console.log('Downloaded and unzip of ' + opts.filename +
                ' complete: \n - ' + targetDir + '/'
                + targetFiles.join(',\n - ' + targetDir + '/') + "\n\n\n");
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
