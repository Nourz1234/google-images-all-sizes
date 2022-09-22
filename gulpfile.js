const { src, dest, series } = require("gulp");
const concat = require("gulp-concat");
const ts = require("gulp-typescript");
const clean = require("gulp-clean");
const map = require('map-stream');
const package = require('./package.json')

let tsProject = ts.createProject("tsconfig.json");

function distClean() {
    let files = [
        './dist/*',
    ];
    return src(files, {read: false})
        .pipe(clean());
}

function build() {
    return src(tsProject.config.include)
        .pipe(map((file, done) => {
            if (!['.js', '.ts'].includes(file.extname))
            {
                let contents = file.contents.toString();
                contents = `FILES['${file.basename}'] = \`${contents}\`;\n`;
                file.contents = Buffer.from(contents);
                file.basename = file.basename + '.js';
            }
            done(null, file);
        }))
        .pipe(tsProject())
        .pipe(concat(`${package.name}.js`))
        .pipe(dest('./dist'));
}

module.exports.default = series(distClean, build);