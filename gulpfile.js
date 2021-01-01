const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const server = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const gulpwebp = require("gulp-webp");
const svgstore = require("gulp-svgstore")
const posthtml = require("gulp-posthtml");
const include = require("posthtml-include");
const terser = require("gulp-terser");
const del = require("del");

// css

const css = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(csso())
    .pipe(rename({ suffix: ".min" }))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
};

exports.css = css;

// html

const html = () => {
  return gulp.src("source/*.html")
    .pipe(posthtml([ include() ]))
    .pipe(gulp.dest("build"));
};

exports.html = html;

// js

const js = () => {
  return gulp.src("source/js/**/*.js")
    .pipe(terser())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("build/js"));
};

exports.js = js;

// copy

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source//*.ico"
    ], {
      base: "source"
    })
  .pipe(gulp.dest("build"));
};

exports.copy = copy;

// clean

const clean = () => {
  return del("build");
};

exports.clean = clean;

// images

const images = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
};

exports.images = images;

// webp

const webp = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(gulpwebp({quality: 90}))
    .pipe(gulp.dest("source/img"));
};

exports.webp = webp;

// sprite

const sprite = () => {
  return gulp.src("source/img/{icon-*,htmlacademy*}.svg")
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
};

exports.sprite = sprite;

// watcher

const watcher = () => {
  server.init({
    server: {
      baseDir: "build"
    },
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series(css));
  gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html")).on("change", server.reload);
  gulp.watch("source/js/*.js", gulp.series("js")).on("change", server.reload);
  gulp.watch("source/*.html", gulp.series(html)).on("change", server.reload);
};

exports.watcher = watcher;

// build

const build = (done) => {
  gulp.series(clean, gulp.parallel(copy, css, js, sprite, html))(done)
};

exports.build = build;

// default

exports.default = gulp.series(build, watcher);
