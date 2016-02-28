/*!
 * gulp-snakeskin
 * https://github.com/SnakeskinTpl/gulp-snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/gulp-snakeskin/blob/master/LICENSE
 */

var
	through = require('through2'),
	PluginError = require('gulp-util').PluginError,
	ext = require('gulp-util').replaceExtension;

var
	snakeskin = require('snakeskin'),
	beautify = require('js-beautify'),
	exists = require('exists-sync'),
	path = require('path');

module.exports = function (options) {
	var
		ssrc = path.join(process.cwd(), '.snakeskinrc');

	if (!options && exists(ssrc)) {
		options = snakeskin.toObj(ssrc);
	}

	options = options || {};
	options.throws = true;
	options.cache = false;
	options.eol = options.eol || '\n';

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
					res = snakeskin.getMainTpl(tpls, info.file, options.tpl) || '';

					if (res) {
						res = res(options.data);

						if (prettyPrint) {
							res = beautify['html'](res);
							res = res.replace(/\r?\n|\r/g, options.eol);
						}

						res += options.eol;
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
