
const { src, pipe, dest, series, parallel, watch } = require('gulp')
const sass = require('gulp-sass')(require('sass'))//编译sass代码
const cssmin = require('gulp-cssmin')//压缩css代码
const rename = require('gulp-rename');//重命名
const autoprefixer = require('gulp-autoprefixer'); // 添加浏览器厂商前缀（can i use）
const babel = require('gulp-babel');// es6转为es5
const concat = require('gulp-concat'); // 合并js或css
const uglify = require('gulp-uglify'); // 压缩js
const browserSync = require('browser-sync'); //自动刷新,页面热更新
const del = require('del')//删除文件和文件夹
const htmlmin = require('gulp-htmlmin'); // html压缩


//压缩html
function CopyHtml() {
    return src('./src/html/index.html')
        //压缩html
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(dest('./dist/'))
}
// //把scss编译成css(执行多个任务)
function CompileCss() {
    return src('./src/sass/*.scss') // 源目录
        .pipe(sass()) // 下一步编译 先编译
        .pipe(autoprefixer())
        .pipe(cssmin()) // 在压缩
        .pipe(rename({
            //重命名
            suffix: ".min"
        }))
        .pipe(dest('./dist/css/')) // 最后输送到目标目录
        .pipe(browserSync.stream()) // 实时把结果同步给浏览器，实现热更新
}

// //合并转换压缩js
function CompressJs() {
    return src('./src/js/*.js')
        .pipe(concat('all.js'))
        .pipe(babel(
            {
                presets: ['@babel/preset-env']
            }
        ))
        .pipe(uglify())
        .pipe(dest('./dist/js/'))
        .pipe(browserSync.stream()) // 实时把结果同步给浏览器，实现热更新
}

function eliminate() {
    //清除目录，防止旧的目录与新目录冲突
    return del(['./dist/'])
}
//监听文件，热更新
function monitor() {
    //启动服务器
    browserSync.init({
        server: './dist/'
    })
    //监听文件并自动执行
    watch('./src/scss/*.scss', CompileCss)//热加载
    watch('./src/js/*.js', CompressJs)//热加载
    watch('./src/html/*.html', CopyHtml).on('change', browserSync.reload) // 页面刷新
}

exports.watchMonitor = monitor;

// exports.server = parallel(CopyHtml, watchMonitor)


// 开发阶段
exports.serve = parallel(CopyHtml, CompileCss, CompressJs, monitor);

//部署阶段
exports.bulid = series(eliminate, parallel(CopyHtml, CompileCss, CompressJs))
