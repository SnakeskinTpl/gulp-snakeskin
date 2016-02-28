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

module.exports = function (opts) {
	var
		ssrc = path.join(process.cwd(), '.snakeskinrc');

	if (!opts && exists(ssrc)) {
		opts = snakeskin.toObj(ssrc);
	}

	opts = opts || {};
	opts.throws = true;
	opts.cache = false;
	opts.eol = opts.eol || '\n';

	var prettyPrint;
	if (opts.exec && opts.prettyPrint) {
		opts.prettyPrint = false;
		prettyPrint = true;
	}

	function compile(file, enc, callback) {
		var info = {file: file.path};

		if (opts.exec) {
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

				if (opts.exec) {
					opts.context = tpls;
				}

				var res = snakeskin.compile(String(file.contents), opts, info);

				if (opts.exec) {
					res = snakeskin.getMainTpl(tpls, info.file, opts.tpl) || '';

					if (res) {
						res = res(opts.data);

						if (prettyPrint) {
							res = beautify['html'](res);
							res = res.replace(/\r?\n|\r/g, opts.eol);
						}

						res += opts.eol;
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
