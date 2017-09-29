/**
 * Created by tingkl on 16/8/1.
 */

var base = require('mix-util');

function getPromise(paths, callback, time, percent) {
    var map = {};
    for (var i = 0; i< paths.length; i++) {
        map[paths[i]] = false;
    }
    var count = 0;
    var fakePercent = 0;
    var it = setInterval(function() {
        fakePercent++;
        if (fakePercent > percent) {
            fakePercent = percent;
            clearInterval(it);
        }
        if (count >= paths.length) {
            callback(true, count, paths.length, map, 100, fakePercent);
            clearInterval(it);
        }
        else {
            var tmp = parseInt((count / paths.length) * (100 - percent)) + fakePercent;
            callback(tmp === 100, count, paths.length, map, tmp, fakePercent);
        }
    }, time / percent);
    return function (path) {
        map[path] = true;
        count ++;
        var flag = true;
        for (var key in map) {
            if (map[key] === false) {
                flag = false;
                break;
            }
        }
        callback(flag, count, paths.length, flag ? map : path, parseInt((count / paths.length) * (100 - percent)) + fakePercent, fakePercent);
    }
}

var imgMap = {}; // 加载图片时存储键值对，便于js中获取图片获得对应的地址（有可能加了hash版本的）
var lazyImgMap = {}; // 懒加载图片时存储键值对，便于js中获取图片获得对应的地址（有可能加了hash版本的）
module.exports = {
    loadImage: function (path, promise, prefix, version) {
        var toSrc = prefix + path;
        var versionReg = /(\?|&)(v|version)=.*$/;
        var shortKeyReg = /images\/.*\.(gif|svg|jpg|png)$/;

        if (!versionReg.test(toSrc)) {
            toSrc += '?version=' + version;
        }

        var originKey = toSrc.replace(versionReg, '');
        var originShortKey = shortKeyReg.exec(originKey); // 便于js里不加前缀获取图片
        imgMap[originKey] = toSrc;
        if (originShortKey) {
            imgMap[originShortKey[0]] = toSrc;
        }

        base.loadImage(toSrc, function () {
            promise(path);
        });
    },
    loadImages: function (paths, callback, time, percent, prefix, version) {
        prefix = prefix || '';
        version = version || 0;
        var promise = getPromise(paths, callback, time, percent);
        for (var i = 0; i< paths.length; i++) {
           this.loadImage(paths[i], promise, prefix, version);
        }
    },
    /**
    * 获取需要预加载的图片并且执行预加载
    * @param {Function} callback 加载成功回调函数
    * @param {Object} preloadConfig 加载配置项
    * @param {number} preloadConfig.fakeTime: 模拟加载时间 
    * @param {number} preloadConfig.fakePercent: 模拟加载百分比
    */
    preloadImg: function (callback, preloadConfig) {
        var defaultConfig = {
            fakeTime: 2000,
            fakePercent: 50,
            prefix: window['MIX_IMAGE_PREFIX']
        };

        preloadConfig = base.extend(defaultConfig || {}, preloadConfig, true);

        var resources = [];

        if (window['MIX_IMAGE_RESOURCE'] && window['MIX_IMAGE_PREFIX']) {
            resources = window['MIX_IMAGE_RESOURCE'];
        }
        else {
            console.error('获取预加载图片列表失败');
        }

        if (window['MIX_LAZY_IMAGE_RESOURCE'] && window['MIX_IMAGE_RESOURCE'].length > 0) {
            this.prepareLazyImgs(
                window['MIX_LAZY_IMAGE_RESOURCE'],
                preloadConfig.prefix,
                preloadConfig.version
            );
        }
        this.loadImages(resources, callback, preloadConfig.fakeTime, preloadConfig.fakePercent
            , preloadConfig.prefix, preloadConfig.version);
    },
    // 如果有需要懒加载的图片则初始化这些图片
    prepareLazyImgs: function (lazyImgs, prefix, version) {
        lazyImgs.forEach(function (img, idx) {
            var toSrc = prefix + img;
            var versionReg = /(\?|&)(v|version)=.*$/;
            var shortKeyReg = /images\/.*\.(gif|svg|jpg|png)$/;

            if (!versionReg.test(toSrc)) {
                toSrc += '?version=' + version;
            }

            var originKey = toSrc.replace(versionReg, '');
            var originShortKey = shortKeyReg.exec(originKey); // 便于js里不加前缀获取图片
            lazyImgMap[originKey] = toSrc;
            if (originShortKey) {
                lazyImgMap[originShortKey[0]] = toSrc;
            }
        });
    },
    // 开始加载需要懒加载的图片
    loadLazy: function (callback) {
        var prefix = window['MIX_IMAGE_PREFIX'];
        var length = window['MIX_LAZY_IMAGE_RESOURCE'].length;
        var loadedLen = 0;

        // 懒加载图片
        window['MIX_LAZY_IMAGE_RESOURCE'].forEach(function(img, idx) {
            base.loadImage(prefix + img, function () {
               console.log(img + ' loaded');
               loadedLen++;
               if (loadedLen >= length) {
                callback && callback();
               }
            });
        })
    },
    // 获取存储的img的key对应的原始地址
    get: function (key) {
        return imgMap[key] || lazyImgMap[key] || key;
    }
};