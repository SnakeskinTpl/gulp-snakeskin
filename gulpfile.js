var gulp = require('gulp'),
	snakeskin = require('./index');

gulp.task('snakeskin', function () {
	gulp.src('./test/fixtures/*.ss')
		.pipe(snakeskin('test.js', {prettyPrint: true}))
		.pipe(gulp.dest('./test/expected'));
});

gulp.task('default', ['snakeskin']);
