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
    globalJson: 'global.json', // global.js里需要包含的文件
    jsRevName: 'rev-js.json',
    autoReload: true, // 是否自动reload有改动的less文件
    notify: true // 是否窗口提示改动
});

// globalJson path: scripts/js/global.json
// jquery/bootstrap等全局的文件会被all in one成global.js

// 然后使用 gulp dev进入开发模式，so-builder会自动监控文件改动，并实时reload
// gulp build去build线上版本

```
