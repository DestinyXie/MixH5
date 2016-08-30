H5 develop tools.

## Installation

    npm install mix-h5

## Usage

```js
var mixtool = require('mix-h5');


// 统计（百度，cnzz）
var tracking = mixtool.tracking;
// init tracking
tracking.add('baidu', 'xxxxxx'); // baidu site id
tracking.add('cnzz', 'xxxxxx'); // cnzz site id


setTimeout(function() {
    tracking.log('loaded');
}, 1000);


// 图片预加载
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
imgLoader.get('images/logo.png'); // 返回带版本号的图片地址，如果有cdn前缀就返回前缀，该方法必须要在preloadImg方法执行之后才能调用


// 设置微信分享内容
var wxtool = mixtool.wx;
wxtool.setShare({
    title: 'xxx', // 分享标题
    link: 'xxx', // 分享链接
    img: 'xxx', // 分享图片
    desc: 'xxx', // 分享描述
    success: function() {...}, // 分享成功回调函数
    fail: function() {...} // 分享失败回调函数
});


// 微信支付
var wxtool = mixtool.wx;
wxtool.pay({
    openid: 'xxx', // 用户openId
    product_id: 'xxx', // 商品ID
    body: 'xxx', // 商品描述
    total_fee: 'xxx', // 总金额
    detail: 'xxx', // 商品详情
    attach: 'xxx', // 附加数据
    out_trade_no: 'xxx', // 商户订单号
    success: function() {...}, // 支付成功回调函数
    fail: function() {...} // 支付失败回调函数
});


// 监测手机横竖屏
mixtool.landscape({
    'pic': 'xxx', // 提示图片
    'text': '为了更好的体验，请将手机/平板竖过来', // 提示文字
    'bgcolor': '#32373b', // 遮罩背景色
    'txtColor': '#ffd40a', // 遮罩字颜色
    'prefix': 'MixShine', // 遮罩class样式名 prefix + '_landscape'
    'zIndex': 10000, // 遮罩z-index值
    'init': false // 监测初始化后回调
}, function() {
    // 横屏回调
}, function () {
    // 竖屏回调
});


// util工具集
var util = mixtool.util;

util.loadScript // 加载js
util.loadImage // 加载图片
util.nextFrame // requestAnimationFrame或者setTimeout fallback
util.cancelFrame // cancelRequestAnimationFrame或者clearTimeout fallback
util.setCssPrefix // 根据浏览器设置css前缀
util.styleVender // 根据浏览器获取css前缀
util.browser // 浏览器内核判断 ex: util.browser.versions.ios
util.isFunction
util.isString
util.isArray
util.getElement // 根据输入内容返回DOM元素，传入字符串就作为DOM的id，传入DOM元素返回本身
util.getOffset // 根据输入内容返回DOM元素，传入字符串就作为DOM的id，传入DOM元素相对给定相对元素或body左上角的偏移量
util.extend // 将源对象的所有属性拷贝到目标对象中
util.genNonceStr // 获取随机数
util.setCookie
util.getCookie
util.getUrlQuery // 读取url上带的参数
util.buildUrlQuery // 拼接url参数

## License
<a href="http://nate.mit-license.org">MIT</a>