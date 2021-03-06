'use strict';

/*!
 * gulp-snakeskin
 * https://github.com/SnakeskinTpl/gulp-snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/gulp-snakeskin/blob/master/LICENSE
 */

const
	fs = require('fs'),
	path = require('path');

const
	through = require('through2'),
	PluginError = require('plugin-error'),
	ext = require('replace-ext');

const
	snakeskin = require('snakeskin'),
	beautify = require('js-beautify');

module.exports = function (opts) {
	const
		src = path.join(process.cwd(), '.snakeskinrc');

	if (!opts && fs.existsSync(src)) {
		opts = snakeskin.toObj(src);
	}

	opts = Object.assign({eol: '\n', dext: '.html'}, opts);

	const
		eol = opts.eol,
		prettyPrint = opts.prettyPrint,
		nRgxp = /\r?\n|\r/g;

	opts.throws = true;
	opts.cache = false;

	if (opts.exec && opts.prettyPrint) {
		opts.prettyPrint = false;
	}

	function compile(file, ignore_enc, cb) {
		const
			info = {file: file.path};

		if (opts.exec) {
			file.path = ext(file.path, opts.dext);

		} else {
			file.path += '.js';
		}

		if (file.isStream()) {
			return cb(new PluginError('gulp-snakeskin', 'Streaming not supported'));
		}

		if (file.isBuffer()) {
			if (opts.adapter || opts.jsx) {
				return require(opts.jsx ? 'ss2react' : opts.adapter).adapter(String(file.contents), opts, info).then(
					(res) => {
						file.contents = Buffer.from(res);
						cb(null, file);
					},

					(err) => {
						cb(new PluginError('gulp-snakeskin', err.message));
					}
				);
			}

			try {
				const
					tpls = {};

				if (opts.exec) {
					opts.module = 'cjs';
					opts.context = tpls;
				}

				let
					res = snakeskin.compile(String(file.contents), opts, info);

				if (opts.exec) {
					res = snakeskin.getMainTpl(tpls, info.file, opts.tpl) || '';

					if (res) {
						return snakeskin.execTpl(res, opts.data).then(
							(res) => {
								if (prettyPrint) {
									res = beautify.html(res);
								}

								file.contents = Buffer.from(res.replace(nRgxp, eol) + eol);
								cb(null, file);
							},

							(err) => {
								cb(new PluginError('gulp-snakeskin', err.message));
							}
						);
					}
				}

				file.contents = Buffer.from(res);
				cb(null, file);

			} catch (err) {
				return cb(new PluginError('gulp-snakeskin', err.message));
			}
		}
	}

	return through.obj(compile);
};
