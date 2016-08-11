H5 delevep tools.

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