var through = require('through2'),
	PluginError = require('gulp-util').PluginError,
	ext = require('gulp-util').replaceExtension;

var snakeskin = require('snakeskin'),
	beautify = require('js-beautify');

module.exports = function (options) {
	options = options || {};

	options.throws = true;
	options.cache = false;
	options.lineSeparator = options.lineSeparator || '\n';

	var prettyPrint;
	if (options.exec && options.prettyPrint) {
		options.prettyPrint = false;
		prettyPrint = true;
	}

	function compile(file, enc, callback) {
		var info = {file: file.path};

		if (options.exec) {
			file.path = ext(file.path, '.html');

		} else {
			file.path += '.js';
		}

		if (file.isStream()) {
			return callback(new PluginError('gulp-snakeskin', 'Streaming not supported'));
		}

		if (file.isBuffer()) {
			try {
				var tpls = {};

				if (options.exec) {
					options.context = tpls;
				}

				var res = snakeskin.compile(String(file.contents), options, info);

				if (options.exec) {
					res = snakeskin.returnMainTpl(tpls, info.file, options.tpl) || '';

					if (res) {
						res = res(options.data);

						if (prettyPrint) {
							res = beautify['html'](res);
							res = res.replace(/\r\n|\r|\n/g, options.lineSeparator);
						}

						res += options.lineSeparator;
					}
				}

				file.contents = new Buffer(res);

			} catch (err) {
				return callback(new PluginError('gulp-snakeskin', err.message));
			}
		}

		callback(null, file);
	}

	return through.obj(compile);
};
