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
});