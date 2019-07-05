//Подключаем галп
const gulp = require('gulp');
//Объединение файлов
const concat = require('gulp-concat');
//Добапвление префиксов
const autoprefixer = require('gulp-autoprefixer');
//Оптимизация html
const htmlmin = require('gulp-htmlmin');
//Оптимизация стилей
const cleanCSS = require('gulp-clean-css');
//Оптимизация скриптов
const uglify = require('gulp-uglify');
//Удаление файлов
const del = require('del');
//Синхронизация с браузером
const browserSync = require('browser-sync').create();
//Для препроцессоров стилей
const sourcemaps = require('gulp-sourcemaps');
//Sass препроцессор
const sass = require('gulp-sass');
//Модуль для сжатия изображений
const imagemin = require('gulp-imagemin');
//Модуль переименовывания файлов
const rename = require('gulp-rename');
//Модуль обьеденения медиа запросов
const gcmq = require('gulp-group-css-media-queries');
//Модуль вывода ошибок
const plumber = require('gulp-plumber');
//Модуль переноса файлов из bower в gulp
const mainBowerFiles = require('main-bower-files');


//Порядок подключения файлов со стилями
const styleFiles = [
   './src/main_files/**/*.css',
   './src/scss/**/*.scss',
   './src/scss/**/*.sass'
]
//Порядок подключения js файлов
const scriptFiles = [
   './src/main_files/**/jquery.js',
   './src/main_files/**/*.js',
   './src/js/**/*.js'
]


//Таск для переноса файлов из bower в gulp
gulp.task('mainFiles', () => {
  return gulp.src(mainBowerFiles())
//Выходная папка для файлов из bower
    .pipe(gulp.dest('./src/main_files'))
});


//Таск для обработки html
gulp.task('html', () => {
  return gulp.src('./src/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true }))
//Проверка на ошибки
    .pipe(plumber())
//Выходная папка для html
    .pipe(gulp.dest('./build'))
    .pipe(browserSync.stream());
});

//Таск для обработки стилей
gulp.task('styles', () => {
   //Шаблон для поиска файлов CSS
   //Всей файлы по шаблону './src/css/**/*.css'
   return gulp.src(styleFiles)
      .pipe(sourcemaps.init())
      //Указать stylus() , sass() или less()
      .pipe(sass())
      //Объединение медиа запросов
      .pipe(gcmq())
      //Объединение файлов в один
      .pipe(concat('style.css'))
      //Добавить префиксы
      .pipe(autoprefixer({
         browsers: ['last 15 versions', '> 1%', 'ie 8', 'ie 7'],
         cascade: true
      }))

      //Минификация CSS
      .pipe(cleanCSS({
         level: 2
      }))

      //Создание sourcemap
      .pipe(sourcemaps.write())

      //Добавление суфикса к сжатым файлам
      .pipe(rename({
         suffix: '.min'
      }))
      //Проверка на ошибки
      .pipe(plumber())
      //Выходная папка для стилей
      .pipe(gulp.dest('./build/css'))
      .pipe(browserSync.stream());
});

//Таск для обработки скриптов
gulp.task('scripts', () => {
   //Шаблон для поиска файлов JS
   //Всей файлы по шаблону './src/js/**/*.js'
   return gulp.src(scriptFiles)
      //Объединение файлов в один
      .pipe(concat('main.js'))
      //Минификация JS
      .pipe(uglify({
         toplevel: true
      }))
      .pipe(rename({
         suffix: '.min'
      }))
      //Проверка на ошибки
      .pipe(plumber()) // plumber
      //Выходная папка для скриптов
      .pipe(gulp.dest('./build/js'))
      .pipe(browserSync.stream());
});

//Таск для очистки папки build
gulp.task('del', () => {
   return del(['build/*'])
});

//Таск для сжатия изображений
gulp.task('img-compress', ()=> {
   return gulp.src('./src/img/**')
   .pipe(imagemin({
      progressive: true
   }))
   .pipe(gulp.dest('./build/img/'))
});

//Таск для отслеживания изменений в файлах
gulp.task('watch', () => {
   browserSync.init({
      server: {
         baseDir: "./build/"
      }
   });
   //Следить за добавлением новых изображений
   gulp.watch('./src/img/**', gulp.series('img-compress'))
    //Следить за файлами с html
   gulp.watch('./src/**/*.html', gulp.series('html'))
   //Следить за файлами со стилями с нужным расширением
   gulp.watch(styleFiles, gulp.series('styles'))
   //Следить за JS файлами
   gulp.watch(scriptFiles, gulp.series('scripts'))
   //При изменении HTML запустить синхронизацию
   gulp.watch("./src/**/*.html").on('change', browserSync.reload);
});

//Таск по умолчанию, Запускает del, styles, scripts, img-compress и watch
gulp.task('default', gulp.series('del', gulp.parallel('html', 'styles', 'scripts', 'img-compress'), 'watch'));
