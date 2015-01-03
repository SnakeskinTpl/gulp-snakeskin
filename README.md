# [gulp](http://gulpjs.com/)-snakeskin

Using [Snakeskin](https://github.com/kobezzza/Snakeskin) templates with Gulp.

[![NPM version](http://img.shields.io/npm/v/gulp-snakeskin.svg?style=flat)](http://badge.fury.io/js/gulp-snakeskin)
[![NPM dependencies](http://img.shields.io/david/kobezzza/gulp-snakeskin.svg?style=flat)](https://david-dm.org/kobezzza/gulp-snakeskin)
[![Build Status](http://img.shields.io/travis/kobezzza/gulp-snakeskin.svg?style=flat&branch=master)](https://travis-ci.org/kobezzza/gulp-snakeskin)

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

## [Options](https://github.com/kobezzza/Snakeskin/wiki/compile#opt_params)

### exec

Type: `Boolean`

Default: `false`

If the parameter is set to `true`, after compiling template will be launched and the results of its work will be saved.

### tpl

Type: `String`

The name of the executable template (if set `exec`), if the parameter is not specified, then uses the rule:

```js
%fileName% || main || index || Object.keys().sort()[0];
```

### data

Type: `?`

Data for the executable template (if set `exec`).

## [License](https://github.com/kobezzza/gulp-snakeskin/blob/master/LICENSE)

The MIT License.
