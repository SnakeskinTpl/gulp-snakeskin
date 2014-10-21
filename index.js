var through = require('through2'),
	PluginError = require('gulp-util').PluginError;

var snakeskin = require('snakeskin'),
	beautify = require('js-beautify');

module.exports = function (options) {
	options = options || {};

	options.throws = true;
	options.cache = false;

	var prettyPrint;
	if (options.exec && options.prettyPrint) {
		options.prettyPrint = false;
		prettyPrint = true;
	}

	function compile(file, enc, callback) {
		var info = {file: file.path};

		if (options.exec) {
			file.path += '.html';

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
						}
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
