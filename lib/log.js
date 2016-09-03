/**
 * @file lib/log.js ~ 2016-08-10 19:30:48
 * @author DestinyXie (xber1986@gmail.com)
 * @description
 * log: baidu/cnzz
 */


var base = require('mix-util');

/**
 * 加载百度统计代码
 * @param {string} bdId 百度统计id
 */
function genBaiduLog (bdId, callback) {
    window._hmt = window._hmt || [];
    var src = '//hm.baidu.com/hm.js?' + bdId;
    base.loadScript(src, function () {
        callback && callback(window._hmt);
    });
}

/**
 * 加载CNZZ统计代码
 * @param {string} cnzzId cnzz统计siteid
 */
function genCNZZLog (cnzzId, callback) {
    var src = '//s4.cnzz.com/stat.php?id=' + cnzzId;
    var statId = 'cnzz_stat_icon_' + cnzzId;
    base.loadScript(src, function () {
        //声明_czc对象:
        window._czc = window._czc || [];
        window._czc.push(["_setAccount", statId]);

        callback && callback(window._czc);
    }, statId);
}

// 统计工具：可用百度统计和cnzz统计
module.exports = {
    _hmt_cache: [],// 保存百度统计js加载结束前发的统计请求
    _czc_cache: [],// 保存cnzz统计js加载结束前发的统计请求
    add: function (type, id) {
        var me = this;
        switch (type) {
            case 'baidu':
                me._need_hmt = true;
                genBaiduLog(id, function (_hmt) {
                    me._hmt = _hmt;

                    if (me._hmt_cache.length > 0) {
                        for (var i = me._hmt_cache.length - 1; i >= 0; i--) {
                            me._hmt.push(me._hmt_cache[i]);
                        }
                    }
                });
                break;
            case 'cnzz':
                me._need_czc = true;
                genCNZZLog(id, function (_czc) {
                    me._czc = _czc;

                    if (me._czc_cache.length > 0) {
                        for (var i = me._czc_cache.length - 1; i >= 0; i--) {
                            me._czc.push(me._czc_cache[i]);
                        }
                    }
                });
                break;
        }
    },

    log: function (cat, action, opt_label, opt_value, opt_nodeid) {
        if (!action) {
            opt_label = action = cat;
        }

        if (this._hmt) {
            this._hmt.push(['_trackEvent', cat, action, opt_label, opt_value]);
        }
        else if (this._need_hmt) {
            this._hmt_cache.push(['_trackEvent', cat, action, opt_label, opt_value]);
        }

        if (this._czc) {
            this._czc.push(['_trackEvent', cat, action, opt_label, opt_value, opt_nodeid]);
        }
        else if (this._need_czc) {
            this._czc_cache.push(['_trackEvent', cat, action, opt_label, opt_value, opt_nodeid]);
        }
    }
};
