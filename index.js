/**
 * @file index.js ~ 2016-08-10 16:15:11
 * @author DestinyXie (xber1986@gmail.com)
 * @description
 * mix h5 module
 */


var util      = require('./lib/base.js');
var tracking  = require('./lib/log.js');
var imgLoader = require('./lib/image-loader.js');
var wx        = require('./lib/wx.js');
var ajax      = require('./lib/ajax.js');
var landscape = require('./lib/landscape.js');

module.exports = {
    util: util,
    tracking: tracking,
    imgLoader: imgLoader,
    wx: wx,
    ajax: ajax,
    landscape: landscape
};
