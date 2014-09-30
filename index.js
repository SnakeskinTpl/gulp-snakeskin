var snakeskin = require('snakeskin');

var through = require('through'),
	gutil = require('gulp-util');

var PluginError = gutil.PluginError,
	path = require('path'),
	File = gutil.File;

module.exports = function (fileName, options) {
	if (!fileName) {
		throw new PluginError('gulp-snakeskin', 'Missing fileName option for gulp-snakeskin');
	}

	options = options || {};
	var buffer = [],
		firstFile = null;

	function bufferContents(file) {
		if (file.isNull()) {
			return;
		}

		if (file.isStream()) {
			return this.emit('error', new PluginError('gulp-snakeskin', 'Streaming not supported'));
		}

		firstFile = firstFile || file;
		buffer.push(file.contents);
	}

	function endStream() {
		if (!buffer.length) {
			return this.emit('end');
		}

		var tmpl = snakeskin.compile(buffer.join('\n'), options);
		var joinedContents = new Buffer(tmpl, 'utf8'),
			joinedPath = path.join(firstFile.base, fileName);

		var joinedFile = new File({
			cwd: firstFile.cwd,
			base: firstFile.base,
			path: joinedPath,
			contents: joinedContents
		});

		this.emit('data', joinedFile);
		this.emit('end');
	}

	return through(bufferContents, endStream);
};
