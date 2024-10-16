const { src, dest, series } = require('gulp');
const replace = require('gulp-replace');
const rename = require('gulp-rename');

const packageJson = require('./package.json');

function copyReadme() {
    return src('README_TEMPLATE.md')
        .pipe(replace('{{NODE_NAME}}', packageJson.n8n.name))
        .pipe(rename('README.md'))
        .pipe(dest('.'));
}

function copyAssets() {
    return src('nodes/**/*.svg')
        .pipe(dest('dist/nodes'));
}

exports.default = series(copyReadme, copyAssets);
