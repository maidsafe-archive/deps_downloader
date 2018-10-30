// const downloader = require('electron-download-fork');
const downloader = require('electron-download');
const unzip = require('unzip');
const os = require('os');
const fs = require('fs');
const path = require('path');

function checkError(err) {
	if(err) {
		console.log(err);
		throw err
	}
}

// wrap the downloader, replacing the filename
// with our custom version and unzip into target
// folder
module.exports = (options, cb) => {
	if (!options.version) {
		throw Error("You must specify a version!")
	}

	const getPlatform = () => {
		switch (os.platform()) {
			case 'linux':
				return 'linux';
			case 'win32':
				return 'win';
			case 'darwin':
				return 'osx';
			default:
				return 'unknown';
		}
	};

	const getArch = () => {
		switch (os.arch()) {
			case 'x64':
				return 'x64';
			case 'ia32':
				return 'x86';
			default:
				return 'unknown';
		}
	};

	const opts = Object.assign({
		'arch': getArch(),
		'platform': getPlatform(),
		'targetDir': process.cwd()
	}, options);

	const prefix = opts.filename;
	const filename = prefix + "-" + opts.version + "-" + opts.platform + "-" + opts.arch + '.zip';
	const targetFilePattern = new RegExp(options.filePattern || '^(' + prefix + '|(lib)' + prefix +'.*\.(dll|so|dylib))$');


	opts.customFilename = filename;
	opts.customDir = '/';
	opts.avoidMiddleUrl = true;
	opts.cache = path.resolve('./lib_zips' );
	console.log('opts being passed innnnn', opts)

	return downloader(opts, (err, zipPath) => {
		checkError(err);
		let targetFiles = [];

		return fs.createReadStream(zipPath)
		  .pipe(unzip.Parse())
		  .on('entry', entry => {
			const fileName = path.basename(entry.path);
			const type = entry.type; // 'Directory' or 'File'
			if (type == 'File' && fileName.match(targetFilePattern)) {
				// only put the specific files into our target dir
				targetFiles.push(fileName)
			  entry.pipe(fs.createWriteStream(path.join(options.targetDir || ".", fileName)));
			} else {
			  entry.autodrain();
			}
		  }).on('finish', () => {
			// inform callback what we extracted
			cb(targetFiles, opts);
		  });
	});
}
