/*!
 * gulp-snakeskin
 * https://github.com/SnakeskinTpl/gulp-snakeskin
 *
 * Released under the MIT license
 * https://github.com/SnakeskinTpl/gulp-snakeskin/blob/master/LICENSE
 */

require('core-js/es6/object');

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
	var ssrc = path.join(process.cwd(), '.snakeskinrc');
	if (!opts && exists(ssrc)) {
		opts = snakeskin.toObj(ssrc);
	}

	opts = Object.assign(
		{
			module: 'umd',
			moduleId: 'tpls',
			useStrict: true,
			eol: '\n'
		},

		opts
	);

	var
		eol = opts.eol,
		mod = opts.module,
		useStrict = opts.useStrict ? '"useStrict";' : '',
		prettyPrint = opts.prettyPrint,
		nRgxp = /\r?\n|\r/g;

	opts.throws = true;
	opts.cache = false;

	if (opts.jsx) {
		opts.literalBounds = ['{', '}'];
		opts.renderMode = 'stringConcat';
		opts.exec = false;

	} else if (opts.exec && opts.prettyPrint) {
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
			try {
				var tpls = {};

				if (opts.exec || opts.jsx) {
					opts.context = tpls;
					opts.module = 'cjs';
				}

				var res = snakeskin.compile(String(file.contents), opts, info);
				var testId = function (id) {
					try {
						var obj = {};
						eval('obj.' + id + '= true');
						return true;

					} catch (ignore) {
						return false;
					}
				};

				var compileJSX = function (tpls, prop) {
					prop = prop || 'exports';
					$C(tpls).forEach(function (el, key) {
						var
							val,
							validKey = false;

						if (testId(key)) {
							val = prop + '.' + key;
							validKey = true;

						} else {
							val = prop + '["' + key.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]';
						}

						if (typeof el !== 'function') {
							res +=
								'if (' + val + ' instanceof Object === false) {' +
									val + ' = {};' +
									(validKey && mod === 'native' ? 'export var ' + key + '=' + val + ';' : '') +
								'}'
							;

							return compileJSX(el, val);
						}

						var
							decl = /function .*?\)\s*\{/.exec(el.toString()),
							text = el(opts.data);

						text = val + ' = ' + decl[0] + (/\breturn\s+\(?\s*[{<](?!\/)/.test(text) ? '' : 'return ') + text + '};';
						res += babel.transform(text, {
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
					res = /\/\*[\s\S]*?\*\//.exec(res)[0];

					if (mod === 'native') {
						res +=
							useStrict +
							'import React from "react";' +
							'var exports = {};' +
							'export default exports;'
						;

					} else {
						res +=
							'(function(global, factory) {' +
								(
									{cjs: true, umd: true}[mod] ?
										'if (typeof exports === "object" && typeof module !== "undefined") {' +
											'factory(exports, typeof React === "undefined" ? require("react") : React);' +
											'return;' +
										'}' :
										''
								) +

								(
									{amd: true, umd: true}[mod] ?
										'if (typeof define === "function" && define.amd) {' +
											'define("' + (opts.moduleId) + '", ["exports", "react"], factory);' +
											'return;' +
										'}' :
										''
								) +

								(
									{global: true, umd: true}[mod] ?
										'factory(global' + (opts.moduleName ? '.' + opts.moduleName + '= {}' : '') + ', React);' :
										''
								) +

							'})(this, function (exports, React) {' +
								useStrict
						;
					}

					compileJSX(tpls);
					if (mod !== 'native') {
						res += '});';
					}

					if (prettyPrint) {
						res = beautify.js(res);
					}

					res = res.replace(nRgxp, eol) + eol;

				} else if (opts.exec) {
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

			} catch (err) {
				return callback(new PluginError('gulp-snakeskin', err.message));
			}
		}

		callback(null, file);
	}

	return through.obj(compile);
};
