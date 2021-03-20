const {
	src,
	dest,
	task,
	series,
	parallel,
	watch
} = require('gulp');
const browserSync = require('browser-sync');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const imagemin = require('gulp-imagemin');
const del = require('del');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const webpack = require('webpack');
const webp = require('gulp-webp');
const svgSprite = require('gulp-svg-sprite');
const svgmin = require('gulp-svgmin');
const cleanCSS = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const gsmq = require('gulp-group-css-media-queries');
const rename = require('gulp-rename');
const pug = require('gulp-pug');
const terser = require('gulp-terser');
const htmlValidator = require('gulp-w3c-html-validator');
const webpackStream = require('webpack-stream');

// ==================================================== 
// System
// ==================================================== 

task('clean', () => {
	return del(['prod/*', 'dev/svg/sprite.svg']);
});

task('webserver', () => {
	browserSync({
		server: {
			baseDir: 'prod'
		},
		notify: true
	});
});

// ==================================================== 



// ==================================================== 
// PUG to HTML
// ==================================================== 

task('html', () => {
	browserSync.notify('PUG compiling...');

	return src(['dev/pug/pages/*.pug', '!dev/pug/modules/_*.pug', '!dev/pug/functions/_*.pug'])
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'HTML',
				message: err.message
			}))
		}))
		.pipe(pug({
			pretty: true
		}))
		.pipe(htmlValidator())
		.pipe(dest('prod/'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

// ==================================================== 



// ==================================================== 
// SASS(SCSS) to CSS
// ==================================================== 


// DEV
task('css', () => {
	browserSync.notify('CSS compiling...');

	return src(['dev/scss/**/*.scss', '!dev/scss/**/_*.scss', 'dev/scss/**/*.sass', '!dev/scss/**/_*.sass', '!dev/scss/libs*.scss'])
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'CSS',
				message: err.message
			}))
		}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer(['last 10 versions', '> 1%', 'ie 11'], {
			cascade: true
		}))
		.pipe(sourcemaps.write())
		.pipe(dest('prod/css'))
		.pipe(browserSync.stream())
});

task('css-libs', () => {
	browserSync.notify('CSS libs compiling...');

	return src('dev/scss/libs*.scss')
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'CSS Libs',
				message: err.message
			}))
		}))
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(sourcemaps.write())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(dest('prod/css'))
		.pipe(browserSync.stream())
});
//

// PROD
task('css-build', () => {
	return src(['dev/scss/**/*.scss', '!dev/scss/**/_*.scss', 'dev/scss/**/*.sass', '!dev/scss/**/_*.sass', '!dev/scss/libs*.scss'])
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'CSS',
				message: err.message
			}))
		}))
		.pipe(sass())
		.pipe(autoprefixer(['last 10 versions', '> 1%', 'ie 11'], {
			cascade: true
		}))
		.pipe(gsmq())
		.pipe(cleanCSS({
			compatibility: 'ie11',
			debug: true
		}, (details) => {
			console.log('\n=================== MAIN CSS ===================\n');
			console.log(`-----------------${details.name}: ${details.stats.originalSize}`);
			console.log(`-----------------${details.name}: ${details.stats.minifiedSize}\n`);
		}))
		.pipe(dest('prod/css'))
		.pipe(browserSync.stream())
});

task('css-libs-build', () => {
	return src('dev/scss/libs*.scss')
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'CSS Libs',
				message: err.message
			}))
		}))
		.pipe(sass())
		.pipe(cleanCSS({
			compatibility: 'ie11',
			debug: true
		}, (details) => {
			console.log('=================== CSS LIBS ===================\n');
			console.log(`-----------------${details.name}: ${details.stats.originalSize}`);
			console.log(`-----------------${details.name}: ${details.stats.minifiedSize}\n`);
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(dest('prod/css'))
		.pipe(browserSync.stream())
});
//

// ==================================================== 



// ==================================================== 
// JS
// ==================================================== 

// DEV
task('js', () => {
	browserSync.notify('JavaScript compiling...');

	return src('dev/components/**/*.js')
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'JavaScript',
				message: err.message
			}))
		}))
		.pipe(sourcemaps.init())
		.pipe(webpackStream({
			output: {
				filename: '[name].js',
			},
			optimization: {
				splitChunks: {
					cacheGroups: {
						vendor: {
							name: 'libs.min',
							test: /[\\/]node_modules[\\/]/,
							chunks: 'all',
							enforce: true
						}
					}
				}
			},
			module: {
				rules: [{
					test: /\.js$/,
					loader: "babel-loader",
					exclude: /[\\/]node_modules[\\/]/,
				}]
			}
		}), webpack)
		.pipe(sourcemaps.write())
		.pipe(dest('prod/js'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

// PROD
task('js-build', () => {
	return src('dev/components/**/*.js')
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'JS',
				message: err.message
			}))
		}))
		.pipe(webpackStream({
			output: {
				filename: '[name].js',
			},
			optimization: {
				splitChunks: {
					cacheGroups: {
						vendor: {
							name: 'libs.min',
							test: /[\\/]node_modules[\\/]/,
							chunks: 'all',
							enforce: true
						}
					}
				}
			},
			module: {
				rules: [{
					test: /\.js$/,
					loader: "babel-loader",
					exclude: /[\\/]node_modules[\\/]/,
				}]
			}
		}), webpack)
		.pipe(terser())
		.pipe(dest('prod/js'))
});
// 

// ==================================================== 



// ==================================================== 
// ASSETS (fonts and images)
// ==================================================== 

task('assets', async () => {
	browserSync.notify('Assets compiling...');

	src(['dev/assets/images/**/*.*', '!dev/assets/images/SVG/**/*.svg'])
		.pipe(webp({
			quality: 90
		}))
		.pipe(dest('prod/assets/images'))

	src('dev/assets/**/*.*')
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'Assets',
				message: err.message
			}))
		}))
		.pipe(dest('prod/assets'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

task('assets-build', async () => {
	src('dev/assets/fonts/**/*.*')
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'Assets-build',
				message: err.message
			}))
		}))
		.pipe(dest('prod/assets/fonts'))

	src(['dev/assets/images/**/*.*', '!dev/assets/images/SVG/**/*.svg'])
		.pipe(webp({
			quality: 75
		}))
		.pipe(dest('prod/assets/images'))

	src('dev/assets/images/**/*.*')
		.pipe(imagemin({
			verbose: true,
			silent: true,
		}, [
			imagemin.gifsicle({
				interlaced: true
			}),
			imagemin.mozjpeg({
				quality: 75,
				progressive: true
			}),
			imagemin.optipng({
				optimizationLevel: 6
			}),
			imagemin.svgo({
				plugins: [{
						removeViewBox: true
					},
					{
						cleanupIDs: false
					}
				]
			})
		]))
		.pipe(dest('prod/assets/images'))
});

task('svg', () => {
	return src('dev/svg/icons/*.svg')
		.pipe(plumber({
			errorHandler: notify.onError(err => ({
				title: 'SVG',
				message: err.message
			}))
		}))
		.pipe(svgmin())
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: "../../svg/sprite.svg",
					prefix: '',
					dimensions: '',
					render: {
						scss: {
							dest: "../../scss/_sprite.scss",
							template: "dev/scss/_sprite_template.scss"
						}
					}
				}
			}
		}))
		.pipe(dest('dev/svg'))
		.pipe(browserSync.reload({
			stream: true
		}))
});

// ==================================================== 



// ==================================================== 
// Gulp tasks
// ==================================================== 

task('build', series('clean', 'svg', parallel('html', 'js-build', 'css-build', 'css-libs-build'), 'assets-build'));

task('watch', () => {
	watch(['dev/scss/**/*.scss', '!dev/scss/libs*.scss', 'dev/components/**/*.scss', 'dev/components/**/*.sass', 'dev/elements/**/**/*.scss'], series('css'));
	watch('dev/scss/libs*.scss', parallel('css-libs'));
	watch(['dev/pug/**/*.pug', 'dev/components/**/*.pug'], series('html'));
	watch(['dev/js/**/*.js', '!dev/js/libs*.js', 'dev/components/**/*.js', 'dev/elements/**/*.js'], series('js'));
	watch('dev/assets/**/*.*', parallel('assets'));
	watch('dev/svg/icons/*.*', series('svg', 'html'));
});

task('create', series('clean', 'svg', parallel('assets', 'html', 'css', 'css-libs', 'js')));
task('default', series('create', parallel('webserver', 'watch')));
