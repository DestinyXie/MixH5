/**
 * @file lib/wx.js ~ 2016-08-16 11:13:59
 * @author DestinyXie (xber1986@gmail.com)
 * @description
 * 微信JSSDK通用功能
 */


var base = require('mix-util');
var ajax = require('./ajax.js');


// 默认设置
var defaultConfig = {
    appId: 'wx888048ccfc4491c8', // mix corp appid  页面域名需要与公众号中设置的回调一致
    appName: 'mix', // 用户和后台公众号账户匹配，default: mix 密石公司appName
    sdkUrl: '//res.wx.qq.com/open/js/jweixin-1.1.0.js',
    siteSignApi: 'http://api.desmix.com/api/siteSign',
    sitePayApi: 'http://api.desmix.com/api/sitePay',
    logApi: 'http://log.desmix.com/api/sharelog', // 发送统计日志接口
    shareApi: 'http://log.desmix.com/api/share', // 发送分享统计日志接口
    saveUserApi: 'http://log.desmix.com/api/saveuser', // 保存页面获取的用户信息
    userinfoApi: 'http://api.desmix.com/coapi/user', // 通过接口获取关注了公众号的用户的用户信息
    jsApiList: [ // 开启的js接口：定制分享内容支付
        'onMenuShareTimeline',
        'onMenuShareAppMessage',
        'chooseWXPay',
        'getNetworkType'
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
var wxInitConfig = null;

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
    wxInitConfig = base.extend(defaultConfig, wxConfig, true);
    
    var nonceStr = base.genNonceStr();
    var timeStr = Math.floor(new Date().getTime() / 1000);


    function getSign(data) {
        wx.config({
            // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
            debug: wxInitConfig.debug,
            // 必填，公众号的唯一标识
            appId: wxInitConfig.appId,
            // 必填，生成签名的时间戳
            timestamp: timeStr,
            // 必填，生成签名的随机串
            nonceStr: nonceStr,
            // 必填，签名，见附录1
            signature: data['sign'],
            // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
            jsApiList: wxInitConfig.jsApiList
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
    loadWXSDK(wxInitConfig.sdkUrl, function () {
        var x = new ajax();
        x.onLoad = function () {
            // console.log(x.response);
            getSign(x.response);
        }
        x.onFail = x.onTimeout = wxInitConfig.initFail;

        var queryParams = {
            url: window.location.href.split('#')[0],
            noncestr: nonceStr,
            timestamp: timeStr
        };
        if ('mix' != wxInitConfig.appName) {
            queryParams.app_name = wxInitConfig.appName;
        }
        x.send(
            wxInitConfig.siteSignApi,
            queryParams
        );
    });
}

/**
 * 获取网络状态
 * @param {Function} cb 获取成功回调
 * @param {boolean=} timeout 超时时间
 */
function getNetworkType(cb, timeout) {
    var getDone = false;
    var getTime = Date.parse(new Date);

    var getTimer = setTimeout(function () {
        if (getDone) {
            return;
        }
        cb(false);
    }, timeout || 2000);

    function _doGetType() {
        wx.getNetworkType({
            success: function (res) {
                getDone = true;
                cb(res.networkType); // 返回网络类型2g，3g，4g，wifi
                clearTimeout(getTimer);
            }
        });
    }

    if (!window['wx']) {
        initWXSDK(null, _doGetType);
    }
    else {
        _doGetType();
    }
}

/**
 * 设置微信分享内容
 * @param {Object} shareConfig 分享配置
 * @param {string} shareConfig.title 分享标题
 * @param {string} shareConfig.link 分享链接
 * @param {string} shareConfig.img 分享图片
 * @param {string=} shareConfig.desc 分享
 * @param {Object=} shareConfig.shareLog 分享统计配置（统计openid、昵称、头像等用户信息）
 * @param {Function=} shareConfig.success 分享成功回调函数
 * @param {Function=} shareConfig.fail 分享失败回调函数
 */
function setShare(shareConfig) {
    function _doSetSahre() {
        var shareLink = shareConfig.link;
        var logConfig = shareConfig.shareLog;


        // 如果有分享监控配置，发送分享监控
        if (logConfig && logConfig.openid) {
            if (!logConfig.nickname && !logConfig.headimgurl) {
                logConfig.nickname = ''; // 用户名
                logConfig.headimgurl = ''; // 头像
                logConfig.sex = ''; // 性别
                logConfig.country = ''; // 国家
                logConfig.province = ''; // 省/区
                logConfig.city = ''; // 城市
                logConfig.unioinid = ''; // 开放平台统一id，平台接入的公众号公用
            }
            else {
                // 若前端获取了用户信息则保存入库
                base.loadImage(defaultConfig.saveUserApi + '?' + base.buildUrlQuery({
                    app_name: wxInitConfig.appName,
                    openid: logConfig.openid,
                    userinfo: JSON.stringify(logConfig)
                }));
            }

            var queryParams = base.getUrlQuery();
            logConfig.fromid = queryParams.fromid || 'root';
            logConfig.device = base.getDeviceName(); // 设备
            logConfig.de_width = document.body.offsetWidth; // 屏幕宽度
            logConfig.de_height = document.body.offsetHeight; // 屏幕高度
            logConfig.spreadtype = queryParams.from || queryParams.spreadtype || 'other'; // 传播来源
            logConfig.refer = location.href; // 页面链接

            if (-1 == ['message', 'timeline', 'groupmessage', 'singlemessage', 'gzh'].indexOf(logConfig.spreadtype)) {
                logConfig.spreadtype = 'other';
            }

            if (shareLink.lastIndexOf('?') < 0) {
                shareLink = shareLink + '?fromid=' + logConfig.openid;
            }
            else {
                shareLink = shareLink + '&fromid=' + logConfig.openid;
            }

            // 获取网络状态
            getNetworkType(function (nettype) {
                logConfig.nettype = nettype || 'unknow';

                // 获取用户信息
                var x = new ajax();
                x.onLoad = function () {
                    var userInfo = x.response;

                    if (userInfo.nickname && 'undefined' !== userInfo.nickname && userInfo.headimgurl) {
                        logConfig.nickname = userInfo.nickname; // 用户名
                        logConfig.headimgurl = userInfo.headimgurl; // 头像
                        logConfig.sex = userInfo.sex; // 性别
                        logConfig.country = userInfo.country; // 国家
                        logConfig.city = userInfo.city; // 城市
                        logConfig.province = userInfo.province; // 省
                        logConfig.unioinid = userInfo.unionid; // 开放平台平台接入的公众号统一id
                    }

                    base.loadImage(defaultConfig.logApi + '?' + base.buildUrlQuery(logConfig));
                };
                x.onFail = function () {
                    base.loadImage(defaultConfig.logApi + '?' + base.buildUrlQuery(logConfig));
                };

                x.send(
                    defaultConfig.userinfoApi,
                    {
                        openid: logConfig.openid
                    }
                );
            });
        }
        wx.onMenuShareTimeline({
            title: shareConfig.title, // 分享标题
            link: shareLink + (shareLink.lastIndexOf('?') < 0 ? '?' : '&') + 'spreadtype=timeline', // 分享链接
            imgUrl: shareConfig.img, // 分享图标
            success: function() {
                // 用户确认分享后执行的回调函数
                if (logConfig && logConfig.openid) {
                    base.loadImage(defaultConfig.shareApi + '?' + base.buildUrlQuery({
                        app_name: logConfig.app_name,
                        openid: logConfig.openid,
                        fromid: queryParams.fromid || 'root',
                        spreadtype: 'timeline'
                    }));
                }
                shareConfig.success && shareConfig.success();
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
                shareConfig.fail && shareConfig.fail();
            }
        });
        wx.onMenuShareAppMessage({
            title: shareConfig.title, // 分享标题
            link: shareLink + (shareLink.lastIndexOf('?') < 0 ? '?' : '&') + 'spreadtype=message', // 分享链接
            imgUrl: shareConfig.img, // 分享图标
            desc: shareConfig.desc || '', // 分享描述
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function() {
                // 用户确认分享后执行的回调函数
                if (logConfig && logConfig.openid) {
                    base.loadImage(defaultConfig.shareApi + '?' + base.buildUrlQuery({
                        app_name: logConfig.app_name,
                        openid: logConfig.openid,
                        fromid: queryParams.fromid || 'root',
                        spreadtype: 'message'
                    }));
                }
                shareConfig.success && shareConfig.success();
            },
            cancel: function() {
                // 用户取消分享后执行的回调函数
                shareConfig.fail && shareConfig.fail();
            }
        });
    }
    if (!window['wx']) {
        initWXSDK(null, _doSetSahre);
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

        var queryParams = {
            timestamp: timeStr,
            nonce_str: nonceStr,
            product_id: payConfig.product_id,
            body: payConfig.body,
            total_fee: payConfig.total_fee,
            detail: payConfig.detail || '',
            attach: payConfig.attach || '',
            out_trade_no: tradeNo,
            openid: payConfig.openid
        };

        if ('mix' != wxInitConfig.appName) {
            queryParams.app_name = wxInitConfig.appName;
        }
        x.send(
            defaultConfig.sitePayApi,
            queryParams
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
    getNetworkType: getNetworkType,
    setShare: setShare,
    pay: pay
};


