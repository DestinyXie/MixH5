/**
 * @file lib/log.js ~ 2016-08-19 16:48:00
 * @author DestinyXie (xber1986@gmail.com)
 * @description
 * landscape tip, inspired from [motion](https://github.com/tgideas/motion)
 */


var base = require('mix-util');

// 默认设置
var defaultConfig = {
    'pic': 'data:image/png;base64,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',
    'bgcolor': '#32373b',
    'txtColor': '#ffd40a',
    'prefix': 'MixShine',
    'picZoom': 2,
    'zIndex': 10000,
    'init': false,
    'text': '为了更好的体验，请将手机/平板竖过来',
    'vetiText': '为了更好的体验，请将手机/平板横过来'
};

function createCss(config) {
    var cssBlock = 
    '.'+config.prefix+'_landscape{display: none; position: fixed; left: 0; top: 0; width: 100%; height: 100%; line-height: 400px; color:'+config.txtColor+'; text-align: center; background-color:'+config.bgcolor+';z-index:'+config.zIndex+';}'
    +'.'+config.prefix+'_landscape:after{position: absolute; content: ""; width: 64px; height: 97px; background-size: 64px 97px; left: 50%; bottom: 50%; margin-left: -32px; -webkit-animation:'+config.prefix+'_landscapeAni 1.5s ease infinite alternate; animation:'+config.prefix+'_landscapeAni 1.5s ease infinite alternate;background-image: url('+config.pic+')}'
    +'@-webkit-keyframes '+config.prefix+'_landscapeAni{0% {-webkit-transform:rotate(-90deg);}30% {-webkit-transform:rotate(-90deg);}70%{-webkit-transform:rotate(0deg);}100% {-webkit-transform:rotate(0deg);}}'
    +'@keyframes '+config.prefix+'_landscapeAni{0% {transform:rotate(-90deg);}30% {transform:rotate(-90deg);}70%{transform:rotate(0deg);}100% {transform:rotate(0deg);}}';
    var style = document.createElement("style");
    style.type = "text/css";
    style.textContent = cssBlock;
    document.getElementsByTagName("HEAD").item(0).appendChild(style);
}

function createDom(config){
    var landscapeDom = document.createElement("div");
    landscapeDom.className= config.prefix+'_landscape';
    landscapeDom.id = config.prefix+'_landscape';
    landscapeDom.innerHTML = config.text;
    document.getElementsByTagName("body")[0].appendChild(landscapeDom);
    return landscapeDom;
}

/**
 * 横竖屏幕监测初始化函数（兼容版本）
 * @param {Object=} config 配置 可选
 * @param {Function=} landback 横屏回调 可选
 * @param {Function=} vetiback 竖屏回调 可选
 */
function initLandscape(config, landback, vetiback) {
    config = base.extend(defaultConfig, config, true);
    function landscape() {
        if(document.body.offsetWidth > document.body.offsetHeight && document.body.offsetWidth > 400) {
            landscapeDom.style.display = "block";
            landback && landback();
        } else {
            landscapeDom.style.display = "none";
            vetiback && vetiback();
        }
    }
    createCss(config);
    var landscapeDom = createDom(config);
    window.addEventListener('DOMContentLoaded',function(){
        setTimeout(function(){
            landscape();
            if(config.init){
                config.init();
            }
        }, 50);
    });
    window.addEventListener("resize", function(){
        setTimeout(function() {
            landscape();
        }, 100)
    }, false);
}

/**
 * 横竖屏幕监测构造函数
 * @param {Object} config 配置 可选
 * @param {Function=} landback 横屏回调 可选
 * @param {Function=} vetiback 竖屏回调 可选
 */
function landAndVeti(config, landback, vetiback) {
    // 手动控制横竖平提示的时机
    if (config && config['manual']) {
        this.init(config, landback, vetiback);
    }
    else {
        // 兼容原横屏提示
        initLandscape(config, landback, vetiback);
    }
}

landAndVeti.prototype.init = function(config, landback, vetiback) {
    this.config = base.extend(defaultConfig, config, true);
    this.landback = landback;
    this.vetiback = vetiback;

    createCss(this.config);
    this.tipDom = createDom(this.config);

    // 禁止横屏
    this.disableLand = false; // 通过设置该值禁止横屏
    // 禁止竖屏
    this.disableVeti = false; // 通过设置该值禁止竖屏

    this.bind();
};

// 处理横竖屏
landAndVeti.prototype.check = function() {
    if(document.body.offsetWidth > document.body.offsetHeight && document.body.offsetWidth > 400) {
        this.tipDom.style.display = this.disableLand ? "block" : "none";
        this.tipDom.className = this.config.prefix+'_landscape';
        this.tipDom.innerHTML = this.config.text;
        this.landback && this.landback();
    } else {
        this.tipDom.style.display = this.disableVeti ? "block" : "none";
        this.tipDom.className = this.config.prefix+'_landscape vetical';
        this.tipDom.innerHTML = this.config.vetiText;
        this.vetiback && this.vetiback();
    }
};

// 监测横竖屏
landAndVeti.prototype.bind = function() {
    var me = this;
    window.addEventListener('DOMContentLoaded',function(){
        setTimeout(function(){
            me.check();
            if(me.config.init){
                me.config.init();
            }
        }, 50);
    });
    window.addEventListener("resize", function(){
        setTimeout(function() {
            me.check();
        }, 100)
    }, false);
};

module.exports = landAndVeti;
