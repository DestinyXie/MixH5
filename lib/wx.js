/**
 * @file lib/wx.js ~ 2016-08-16 11:13:59
 * @author DestinyXie (xber1986@gmail.com)
 * @description
 * 微信JSSDK通用功能
 */


var base = require('./base.js');
var ajax = require('./ajax.js');


// 默认设置
var defaultConfig = {
    appId: 'wx888048ccfc4491c8', // mix corp appid  页面域名需要与公众号中设置的回调一致
    sdkUrl: '//res.wx.qq.com/open/js/jweixin-1.1.0.js',
    siteSignApi: 'http://jishub.com/api/siteSign',
    sitePayApi: 'http://jishub.com/api/sitePay',
    jsApiList: [ // 开启的js接口：定制分享内容支付
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'chooseWXPay'
    ],
    initFail: function () {
        console.log('wx init fail');
    },
    initDone: function () {
        console.log('wx init done');
    },
    debug: false
};
var wxInited = false;

// 加载微信JSSDK
function loadWXSDK(url, callback) {
    if (window['wx']) {
        callback && callback();
    }
    else {
        base.loadScript(url, callback);
    }
}

/**
 * 初始化微信JSSDK
 * @param {Object} wxConfig 微信配置
 * @param {Function} readyCb 微信配置成功回调
 */
function initWXSDK(wxConfig, readyCb) {
    wxConfig = base.extend(defaultConfig, wxConfig);
    
    var nonceStr = base.genNonceStr();
    var timeStr = Math.floor(new Date().getTime() / 1000);


    function getSign(data) {
        wx.config({
            // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            debug: wxConfig.debug,
            // 必填，公众号的唯一标识
            appId: wxConfig.appId,
            // 必填，生成签名的时间戳
            timestamp: timeStr,
            // 必填，生成签名的随机串
            nonceStr: nonceStr,
            // 必填，签名，见附录1
            signature: data['sign'],
            // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            jsApiList: wxConfig.jsApiList
        });

        wx.error(function(res) {
            // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
            // alert(JSON.stringify(res));
        });

        wx.ready(function () {
            base.setCookie('wx', true);
            wxInited = true;
            readyCb && readyCb();
        });
    }
    loadWXSDK(wxConfig.sdkUrl, function () {
        var x = new ajax();
        x.onLoad = function () {
            // console.log(x.response);
            getSign(x.response);
        }
        x.onFail = x.onTimeout = wxConfig.initFail;
        x.send(
            wxConfig.siteSignApi,
            {
                url: window.location.href.split('#')[0],
                noncestr: nonceStr,
                timestamp: timeStr
            }
        );
    });
}

/**
 * 设置微信分享内容
 * @param {Object} shareConfig 分享配置
 * @param {string} shareConfig.title 分享标题
 * @param {string} shareConfig.link 分享链接
 * @param {string} shareConfig.img 分享图片
 * @param {string=} shareConfig.desc 分享
 * @param {Function=} shareConfig.success 分享成功回调函数
 * @param {Function=} shareConfig.fail 分享失败回调函数
 */
function setShare(shareConfig) {
    function _doSetSahre() {
        wx.onMenuShareTimeline({
            title: shareConfig.title, // 分享标题
            link: shareConfig.link, // 分享链接
            imgUrl: shareConfig.img, // 分享图标
            success: function() {
                // 用户确认分享后执行的回调函数
                shareConfig.success && shareConfig.success();
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
                shareConfig.fail && shareConfig.fail();
            }
        });
        wx.onMenuShareAppMessage({
            title: shareConfig.title, // 分享标题
            link: shareConfig.link, // 分享链接
            imgUrl: shareConfig.img, // 分享图标
            desc: shareConfig.desc || '', // 分享描述
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function() {
                // 用户确认分享后执行的回调函数
                shareConfig.success && shareConfig.success();
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
                shareConfig.fail && shareConfig.fail();
            }
        });
    }
    if (!window['wx']) {
        initWXSDK(null, _doSetSahre)
    }
    else {
        _doSetSahre();
    }
}



/**
 * 微信支付
 * @param {Object} payConfig 支付配置
 * @param {string} payConfig.openid 用户openId
 * @param {string} payConfig.product_id 商品ID
 * @param {string} payConfig.body 商品描述
 * @param {string} payConfig.total_fee 总金额
 * @param {string=} payConfig.detail 商品详情
 * @param {string=} payConfig.attach 附加数据
 * @param {string=} payConfig.out_trade_no 商户订单号
 * @param {Function=} payConfig.success 支付成功回调函数
 * @param {Function=} payConfig.fail 支付失败回调函数
 */
function pay(payConfig) {
    if (!payConfig.openid || !payConfig.product_id || !payConfig.body || !payConfig.total_fee) {
        alert('支付配置参数不全');
        return;
    }
    function _doPay() {
        var nonceStr = base.genNonceStr();
        var timeStr = Math.floor(new Date().getTime() / 1000);
        var tradeNo = payConfig.out_trade_no || new Date().getTime() + nonceStr; // 随机生成订单号

        var x = new ajax();
        x.onLoad = function () {
            var data = x.response;
            wx.chooseWXPay({
                timestamp: timeStr, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr: nonceStr, // 支付签名随机串，不长于 32 位
                package: 'prepay_id=' + data['prepay_id'], // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                signType: 'MD5', // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign: data['js_sdk_sign'], // 支付签名
                success: function (res) {
                    // 支付成功后的回调函数
                    payConfig.success && payConfig.success();
                }
            });
        }
        x.onFail = x.onTimeout = payConfig.fail;
        x.send(
            defaultConfig.sitePayApi,
            {
                timestamp: timeStr,
                nonce_str: nonceStr,
                product_id: payConfig.product_id,
                body: payConfig.body,
                total_fee: payConfig.total_fee,
                detail: payConfig.detail || '',
                attach: payConfig.attach || '',
                out_trade_no: tradeNo,
                openid: payConfig.openid
            }
        );
    }
    if (!window['wx']) {
        initWXSDK(null, _doPay)
    }
    else {
        _doPay();
    }
}



module.exports = {
    checkInit: function () {
        return wxInited;
    },
    init: initWXSDK,
    setShare: setShare,
    pay: pay
};


