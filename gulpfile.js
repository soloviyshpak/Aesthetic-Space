const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');

function pages() {
  return src('app/pages/*.html')
    .pipe(
      include({
        includePaths: 'app/components/',
      })
    )
    .pipe(dest('app'))
    .pipe(browserSync.stream());
}

function fonts() {
  return src('app/fonts/src/*.*')
    .pipe(
      fonter({
        formats: ['woff', 'ttf', 'eot'],
      })
    )
    .pipe(src('app/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest('app/fonts'));
}

function sprite() {
  return src('app/img/**/*.svg')
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg',
            example: true,
          },
        },
      })
    )
    .pipe(dest('app/img'));
}

function images() {
  return src(['app/img/src/**/*.*', '!app/img/src/**/*.svg'])
    .pipe(newer('app/img/'))
    .pipe(avif({ quality: 50 }))

    .pipe(src('app/img/src/**/*.*'))
    .pipe(newer('app/img/'))
    .pipe(webp())

    .pipe(src('app/img/src/**/*.*'))
    .pipe(newer('app/img/'))
    .pipe(imagemin())

    .pipe(dest('app/img/'));
}

function scripts() {
  return src(['node_modules/swiper/swiper-bundle.js', 'app/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

async function styles() {
  const autoprefixer = (await import('gulp-autoprefixer')).default;

  return src('app/scss/main.scss')
    .pipe(autoprefixer({ overrideBrowserslist: ['last 10 version'] }))
    .pipe(concat('main.min.css'))
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function watching() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
    browser: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  });

  watch(['app/scss/main.scss', 'app/scss/media.scss'], styles);
  watch(['app/img/src/*'], images);
  watch(['app/js/main.js'], scripts);
  watch(['app/components/*', 'app/pages/*'], pages);
  watch(['app/*.html']).on('change', browserSync.reload);
}

function cleanDist() {
  return src('dist').pipe(clean());
}

function building() {
  return src(
    [
      'app/**/*.html',
      '!app/components/**/*.html',
      '!app/pages/**/*.html',
      '!app/img/stack/**/*.html',
      'app/img/*.*',
      '!app/img/*.svg',
      'app/img/sprite.svg',
      'app/css/main.min.css',
      'app/fonts/*.*',
      'app/js/main.min.js',
    ],
    {
      base: 'app',
    }
  ).pipe(dest('dist'));
}

exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.building = building;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;

exports.build = series(cleanDist, building);
exports.default = parallel(styles, images, scripts, pages, watching);
