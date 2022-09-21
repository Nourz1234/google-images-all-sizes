const { src, dest, series } = require("gulp");
const concat = require("gulp-concat");
const ts = require("gulp-typescript");
const clean = require("gulp-clean");
const map = require('map-stream');
const fs = require('fs');
const package = require('./package.json')

let tsProject = ts.createProject("tsconfig.json");

function distCleanup() {
    let files = [
        './dist/*',
    ];
    return src(files, {read: false})
        .pipe(clean());
}

function files() {
    return src(["./src/files/*"])
        .pipe(map((file, done) => {
            let contents = file.contents.toString();
            contents = `FILES['${file.basename}'] = \`${contents}\`;\n`;
            file.contents = Buffer.from(contents);
            done(null, file);
        }))
        .pipe(concat('filesContent.js'))
        .pipe(dest('./build/src'));
}

function build() {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(dest('./build'));
}

function combine() {
    let files = [];
    files.push('./build/src/header.js');                // userscript header
    files.push('./build/node_modules/**/*.js');         // libraries
    files.push('./build/src/files.js');                 // files declaration
    if (fs.existsSync('./build/src/filesContent.js'))
        files.push('./build/src/filesContent.js');      // files content
    files.push('./build/src/main.js');                  // main script
    
    return src(files)
        .pipe(concat(`${package.name}.js`))
        .pipe(dest('./dist'));
}

function buildCleanup() {
    let files = [
        './build',
    ];
    return src(files, {read: false})
        .pipe(clean());
}

module.exports.default = series(distCleanup, files, build, combine, buildCleanup);