var gulp = require('gulp'),
    runSequence = require('run-sequence'),   //让gulp任务，可以相互独立，解除任务间的依赖，增强task复用
    gulpif = require('gulp-if'),  //
    bower = require('gulp-bower'), //bower
    uglify = require('gulp-uglify'), //js压缩
    less = require('gulp-less'),  //less便宜
    csslint = require('gulp-csslint'), //css代码检测
    rev = require('gulp-rev'), //更换版本号
    minifyCss = require('gulp-minify-css'), //css压缩
    changed = require('gulp-changed'), //用来过滤未被修改过的文件，只有修改后的文件才能通过管道。这样做的好处时，只处理修改后的文件，减少后续程序的执行时间。
    jshint = require('gulp-jshint'), //js代码检测
    stylish = require('jshint-stylish'), //js代码风格检测
    revCollector = require('gulp-rev-collector'), //从manifests中获取静态资源版本数据, 该数据由不同的流产生, 并且替换html中的链接
    minifyHtml = require('gulp-minify-html'), //html代码压缩
    autoprefixer = require('gulp-autoprefixer'), //可以根据我们的设置帮助我们自动补全浏览器的前缀(如：-moz、-ms、-webkit、-o)
    del = require('del'),//node原生删除模块
    clean = require('gulp-clean') //清空文件夹


// src  源文件
// dest  目标文件
var cssSrc = ['main.less', 'layer-box.less', 'tag.less'],
    cssDest = 'dist/css',
    jsSrc = 'src/js/*.js',
    jsDest = 'dist/js',
    fontSrc = 'src/fonts/*',
    fontDest = 'dist/font',
    imgSrc = 'src/img/*',
    imgDest = 'dist/img',
    cssRevSrc = 'src/css/revCss',

    htmlSrc = 'src/*.html',

    condition = true;




function changePath(basePath){
    var nowCssSrc = [];
    for (var i = 0; i < cssSrc.length; i++) {
        nowCssSrc.push(cssRevSrc + '/' + cssSrc[i]);
    }
    return nowCssSrc;
}

//删除文件
// var config = require('./config').clean;
gulp.task("clean", function(){
    return gulp.src('dist/')
        .pipe(clean());
})

//Fonts & Images 根据MD5获取版本号
gulp.task('revFont', function(){
    return gulp.src(fontSrc)
        .pipe(rev())
        .pipe(gulp.dest(fontDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/font'));
});
gulp.task('revImg', function(){
    return gulp.src(imgSrc)
        .pipe(rev())
        .pipe(gulp.dest(imgDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/img'));
});

//检测JS
gulp.task('lintJs', function(){
    return gulp.src(jsSrc)
        //.pipe(jscs())   //检测JS风格
        .pipe(jshint({
            "undef": false,
            "unused": false
        }))
        //.pipe(jshint.reporter('default'))  //错误默认提示
        .pipe(jshint.reporter(stylish))   //高亮提示
        .pipe(jshint.reporter('fail'));
});

//压缩JS/生成版本号
gulp.task('miniJs', function(){
    return gulp.src(jsSrc)
        .pipe(gulpif(
            condition, uglify()
        ))
        .pipe(rev())
        .pipe(gulp.dest(jsDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/js'));
});

//CSS里更新引入文件版本号
gulp.task('revCollectorCss', function () {
    return gulp.src(['src/rev/**/*.json', 'src/css/*.less'])
        .pipe(revCollector())
        .pipe(gulp.dest(cssRevSrc));
});

//检测CSS
gulp.task('lintCss', function(){
    return gulp.src(cssSrc)
        .pipe(csslint())
        .pipe(csslint.reporter())
        .pipe(csslint.failReporter());
});


//压缩/合并CSS/生成版本号
gulp.task('miniCss', function(){
    return gulp.src(changePath(cssRevSrc))
        .pipe(less())
        .pipe(gulpif(
            condition, minifyCss({
                compatibility: 'ie7'
            })
        ))
        .pipe(rev())
        .pipe(gulpif(
                condition, changed(cssDest)
        ))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false,
            remove: false       
        }))
        .pipe(gulp.dest(cssDest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('src/rev/css'));
});

//压缩Html/更新引入文件版本
gulp.task('miniHtml', function () {
    return gulp.src(['src/rev/**/*.json', 'src/*.html'])
        .pipe(revCollector())
        .pipe(gulpif(
            condition, minifyHtml({
                empty: true,
                spare: true,
                quotes: true
            })
        ))
        .pipe(gulp.dest('dist'));
});

// bower 插件导出（无废弃文件但是要查找要用的文件）
gulp.task('bower', function() {
    gulp.src('./bower_components/jquery/dist/*.js')
        .pipe(gulp.dest('./dist/js/jquery/'));
    gulp.src('./bower_components/bootstrap/dist/css/*')
        .pipe(gulp.dest('./dist/css/bootstrap/'));
    gulp.src('./bower_components/bootstrap/dist/js/*.js')
        .pipe(gulp.dest('./dist/js/bootstrap/'));

    // 产生垃圾文件
    // return bower('./bower_components').pipe(gulp.dest('js/lib'));
});
// 本地插件导出（无废弃文件但是要查找要用的文件）
gulp.task('localjs', function() {
    gulp.src('./src/js/**/*.js')
        .pipe(gulp.dest('./dist/js/'));

    // 产生垃圾文件
    // return bower('./bower_components').pipe(gulp.dest('js/lib'));
});

gulp.task('delRevCss', function(){
    del([cssRevSrc,cssRevSrc.replace('src/', 'dist/')]);    
});

//意外出错？清除缓存文件
gulp.task('clean1', function(){
    del([cssRevSrc ,cssRevSrc.replace('src/', 'dist/')]);
});



//监听更改
gulp.task('watch', ['clean'],function(){
    gulp.watch(cssSrc,['dev']);
    gulp.watch(jsSrc,['dev']);
    gulp.watch(imgSrc,['dev']);
    gulp.watch(htmlSrc,['dev']);
    gulp.watch(fontSrc,['dev']);
    gulp.watch(cssRevSrc,['dev']);
});

//开发构建
gulp.task('dev', ['clean'],function (done) {
    condition = false;
    runSequence(
         ['watch','revFont', 'revImg'],
         ['lintJs','localjs','bower'],
         ['revCollectorCss'],
         ['miniCss', 'miniJs'],
         ['miniHtml', 'delRevCss'],
    done);
});

//正式构建
gulp.task('build', function (done) {
    runSequence(
         ['clean1','revFont', 'revImg'],
         ['lintJs'],
         ['revCollectorCss'],
         ['miniCss', 'miniJs','bower'],
         ['miniHtml', 'delRevCss'],
    done);
});


gulp.task('default', ['dev']);
