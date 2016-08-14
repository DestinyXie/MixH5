H5 develop tools.

## Installation

    npm install mix-h5

## Usage

```js
var mixtool = require('mix-h5');

// tracking
var tracking = mixtool.tracking;
// init tracking
tracking.add('baidu', 'xxxxxx'); // baidu site id
tracking.add('cnzz', 'xxxxxx'); // cnzz site id


setTimeout(function() {
    tracking.log('loaded');
}, 1000};


// img preloader
var imgLoader = mixtool.imgLoader;
// over: preload over, count: loaded image length, length: preload image total length
// map: loaded image name, percent: count/length, fakePercent: fake percent
imgLoader.preloadImg(function(over, count, length, map, percent, fakePercent) {
    if(over && 100 == percent) {
        // todo
    } else {
        console.log(percent);
    }
}, {
    selector: 'xxx', // 预加载图片地址筛选器, default: '.image-resource-wrap span, img.image-resource'
    fakeTime: xxx, // 模拟加载时间, default: 2000
    fakePercent: xxx // 模拟加载百分比, default: 50
});
// get preload image
imgLoader.get('images/logo.png'); // 返回带版本号的图片地址，如果有cdn前缀就返回前缀