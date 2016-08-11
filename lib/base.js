/**
 * @file mix.base.js ~ 2016-08-10 19:34:15
 * @author DestinyXie (xber1986@gmail.com)
 * @description
 * base util
 */


/**
 * 加载js脚本
 * @param {string} bdId 百度统计id
 */
function loadScript(src, callback, idAttr) {
    var js = document.createElement('script');
    js.src = src;
    if (idAttr) {
        js.id = idAttr;
    }
    var parent = (document.head || document.getElementsByTagName('head')[0] || document.body);
    js.onload = function () {
        parent.removeChild(js);
        callback && callback();
    }
    parent.appendChild(js);
}


module.exports = {
    loadScript: loadScript
};
