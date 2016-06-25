/*!
 * gulp-snakeskin
 * https://github.com/SnakeskinTpl/gulp-snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/gulp-snakeskin/blob/master/LICENSE
 */

require('core-js/es6/object');

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
	var ssrc = path.join(process.cwd(), '.snakeskinrc');
	if (!opts && exists(ssrc)) {
		opts = snakeskin.toObj(ssrc);
	}

	opts = Object.assign({eol: '\n'}, opts);

	var
		eol = opts.eol,
		prettyPrint = opts.prettyPrint,
		nRgxp = /\r?\n|\r/g;

	opts.throws = true;
	opts.cache = false;

	if (opts.exec && opts.prettyPrint) {
		opts.prettyPrint = false;
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
			var res;
			if (opts.adaptor || opts.jsx) {
				require(opts.jsx ? 'ss2react' : opts.adaptor).adaptor(String(file.contents), opts, info).then(
					function (res) {
						file.contents = new Buffer(res);
						callback(null, file);
					},

					function (err) {
						callback(new PluginError('gulp-snakeskin', err.message));
					}
				);

			} else {
				try {
					var tpls = {};

					if (opts.exec) {
						opts.module = 'cjs';
						opts.context = tpls;
					}

					res = snakeskin.compile(String(file.contents), opts, info);

					if (opts.exec) {
						res = snakeskin.getMainTpl(tpls, info.file, opts.tpl) || '';

						if (res) {
							res = res(opts.data);

							if (prettyPrint) {
								res = beautify.html(res);
							}

							res = res.replace(nRgxp, eol) + eol;
						}
					}

					file.contents = new Buffer(res);
					callback(null, file);

				} catch (err) {
					return callback(new PluginError('gulp-snakeskin', err.message));
				}
			}
		}
	}

	return through.obj(compile);
};
