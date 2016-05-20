/*!
 * gulp-snakeskin
 * https://github.com/SnakeskinTpl/gulp-snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/gulp-snakeskin/blob/master/LICENSE
 */

var
	$C = require('collection.js').$C,
	through = require('through2'),
	PluginError = require('gulp-util').PluginError,
	ext = require('gulp-util').replaceExtension;

var
	snakeskin = require('snakeskin'),
	babel = require('babel-core'),
	beautify = require('js-beautify'),
	exists = require('exists-sync'),
	path = require('path');

module.exports = function (opts) {
	var
		ssrc = path.join(process.cwd(), '.snakeskinrc'),
		prettyPrint;

	if (!opts && exists(ssrc)) {
		opts = snakeskin.toObj(ssrc);
	}

	opts = opts || {};
	opts.throws = true;
	opts.cache = false;
	var n = opts.eol = opts.eol || '\n';

	if (opts.jsx) {
		opts.literalBounds = ['{', '}'];
		opts.renderMode = 'stringConcat';
		opts.exec = false;

	} else if (opts.exec && opts.prettyPrint) {
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

				if (opts.exec || opts.jsx) {
					opts.context = tpls;
				}

				var res = snakeskin.compile(String(file.contents), opts, info);
				var compileJSX = function (tpls, prop) {
					prop = prop || 'exports';
					$C(tpls).forEach(function (el, key) {
						var val = prop + '["' + key.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]';

						if (typeof el !== 'function') {
							res += 'if (' + val + ' instanceof Object === false) {' + n + '  ' + val + ' = {};' + n + '}' + n + n;
							return compileJSX(el, val);
						}

						var decl = /function .*?\)\s*\{/.exec(el.toString());
						res += babel.transform(val + ' = ' + decl[0] + ' ' + el(opts.data) + '};', {
							babelrc: false,
							plugins: [
								require('babel-plugin-syntax-jsx'),
								require('babel-plugin-transform-react-jsx'),
								require('babel-plugin-transform-react-display-name')
							]
						}).code;
					});
				};

				if (opts.jsx) {
					res = '';
					compileJSX(tpls);

				} else if (opts.exec) {
					res = snakeskin.getMainTpl(tpls, info.file, opts.tpl) || '';

					if (res) {
						res = res(opts.data);

						if (prettyPrint) {
							res = beautify['html'](res);
							res = res.replace(/\r?\n|\r/g, n);
						}

						res += n;
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
