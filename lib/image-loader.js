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
    * 获取html中需要预加载的图片并且执行预加载
    * @param {Function} callback 加载成功回调函数
    * @param {Object} preloadConfig 加载配置项
    * @param {string} preloadConfig.selector 预加载图片地址筛选器 
    * @param {number} preloadConfig.fakeTime: 模拟加载时间 
    * @param {number} preloadConfig.fakePercent: 模拟加载百分比
    */
    preloadImg: function (callback, preloadConfig) {
        var defaultConfig = {
            selector: '.image-resource-wrap span, img.image-resource',
            fakeTime: 2000,
            fakePercent: 50
        };

        preloadConfig = base.extend(defaultConfig || {}, preloadConfig, true);

        var resources = [];
        $(preloadConfig.selector).each(function (idx, res) {
            resources.push($(res).attr('src'));
        });

        this.loadImages(resources, callback, preloadConfig.fakeTime, preloadConfig.fakePercent
            , preloadConfig.prefix, preloadConfig.version);
    },
    // 获取存储的img的key对应的原始地址
    get: function (key) {
        return imgMap[key] || key;
    }
};