[gulp](http://gulpjs.com/)-snakeskin
====================================

Using [Snakeskin](https://github.com/SnakeskinTpl/Snakeskin) templates with Gulp.

[![NPM version](http://img.shields.io/npm/v/gulp-snakeskin.svg?style=flat)](http://badge.fury.io/js/gulp-snakeskin)
[![Build Status](http://img.shields.io/travis/SnakeskinTpl/gulp-snakeskin.svg?style=flat&branch=master)](https://travis-ci.org/SnakeskinTpl/gulp-snakeskin)
[![NPM dependencies](http://img.shields.io/david/SnakeskinTpl/gulp-snakeskin.svg?style=flat)](https://david-dm.org/SnakeskinTpl/gulp-snakeskin)
[![NPM devDependencies](http://img.shields.io/david/dev/SnakeskinTpl/gulp-snakeskin.svg?style=flat)](https://david-dm.org/SnakeskinTpl/gulp-snakeskin#info=devDependencies&view=table)
[![NPM peerDependencies](https://david-dm.org/SnakeskinTpl/gulp-snakeskin/peer-status.svg)](https://david-dm.org/SnakeskinTpl/gulp-snakeskin#info=peerDependencies)

## Install

```bash
npm install gulp-snakeskin --save-dev
```

## Usage

```js
var gulp = require('gulp'),
    snakeskin = require('gulp-snakeskin');

gulp.task('snakeskin', function () {
  gulp.src('./templates/**/*.ss')
    .pipe(snakeskin({prettyPrint: true}))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('default', ['snakeskin']);
```

## [Options](http://snakeskintpl.github.io/docs/api.html#compile--opt_params)
### jsx

Type: `Boolean`

Default: `false`

If the parameter is set to `true` the templates will be converted for using with [React](https://facebook.github.io/react/index.html).
If React attached as an external script, don't forget to add the external to the WebPack config.

### exec

Type: `Boolean`

Default: `false`

If the parameter is set to `true` the template will be launched after compiling and the results of it work will be saved.

### tpl

Type: `String`

The name of the executable template (if is set `exec`), if the parameter is not specified, then uses the rule:

```js
%fileName% || main || index || Object.keys().sort()[0];
```

### data

Type: `?`

Data for the executable template (if is set `exec`).

## [License](https://github.com/SnakeskinTpl/gulp-snakeskin/blob/master/LICENSE)

The MIT License.
