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

	function compile(file, enc, cb) {
		var info = {file: file.path};

		if (opts.exec) {
			file.path = ext(file.path, '.html');

		} else {
			file.path += '.js';
		}

		if (file.isStream()) {
			return cb(new PluginError('gulp-snakeskin', 'Streaming not supported'));
		}

		if (file.isBuffer()) {
			if (opts.adapter || opts.jsx) {
				return require(opts.jsx ? 'ss2react' : opts.adapter).adapter(String(file.contents), opts, info).then(
					function (res) {
						file.contents = new Buffer(res);
						cb(null, file);
					},

					function (err) {
						cb(new PluginError('gulp-snakeskin', err.message));
					}
				);
			}

			try {
				var tpls = {};

				if (opts.exec) {
					opts.module = 'cjs';
					opts.context = tpls;
				}

				var res = snakeskin.compile(String(file.contents), opts, info);

				if (opts.exec) {
					res = snakeskin.getMainTpl(tpls, info.file, opts.tpl) || '';

					if (res) {
						return snakeskin.execTpl(res, opts.data).then(
							function (res) {
								if (prettyPrint) {
									res = beautify.html(res);
								}

								file.contents = new Buffer(res.replace(nRgxp, eol) + eol);
								cb(null, file);
							},

							function (err) {
								cb(new PluginError('gulp-snakeskin', err.message));
							}
						);
					}
				}

				file.contents = new Buffer(res);
				cb(null, file);

			} catch (err) {
				return cb(new PluginError('gulp-snakeskin', err.message));
			}
		}
	}

	return through.obj(compile);
};
