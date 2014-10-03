var through = require('through2'),
	snakeskin = require('snakeskin'),
	PluginError = require('gulp-util').PluginError;

module.exports = function (options) {
	options = options || {};
	options.throws = true;

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
							res =  beautify['html'](res);
						}
					}
				}

				file.contents = res;

			} catch (err) {
				return callback(new PluginError('gulp-snakeskin', err));
			}
		}

		callback(null, file);
	}

	return through.obj(compile);
};
