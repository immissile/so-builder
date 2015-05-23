so-builder
============

Niubility build tools for so.


## Install

```
npm install so-builder
```

## Usage
```javascript
var gulp = require('gulp');
var Builder = require('so-builder');

Builder(gulp, {
    appRoot: __dirname,
    distRoot: 'dist',
    lessRoot: 'styles/less',
    cssRoot: 'styles/css',
    cssDist: 'dist/css',
    cssRevName: 'rev-css.json',
    jsRoot: 'scripts/js',
    jsDist: 'dist/js',
    commonJson: 'common.json', // common.js里需要包含的文件
    jsRevName: 'rev-js.json',
    notify: true
});

// commonJson path: scripts/js/common.json

then use cmd:
gulp dev
gulp build

```
