var request = require('request');
let header = require('./utils/header');
let jsonUtils = require('./utils/jsonUtils');
var propertiesreader = require('properties-reader');
const uuidv4 = require('uuid/v4');
var dateFormat = require('dateformat');
var cache = require('memory-cache');
const zlib = require('zlib');
require('dotenv').config();

function getEndpoint(reqType, reqValue, req, res) {
  var properties = propertiesreader(process.env.APP_PROPERTIES);
  var envType = process.env.RUNTIME_ENV_TYPE;
  var __CACHE_KEY__ = properties.get('global_CACHE_KEY');
  let key = __CACHE_KEY__ + req.originalUrl || req.url;
  var __HTTP_SUCCESS__ = Number(properties.get('global_HTTP_SUCCESS'));

  let cachedBody = cache.get(key)
  if (cachedBody){
    console.log("Responding from cache ..")
    res = header.setHeaders(res, __HTTP_SUCCESS__);
    res.end(cachedBody);
  }else{
    var statusCode = 0;
    console.log("Going to backend ..")
    var __CACHE_TIMEOUT__ = Number(properties.get(reqType + '_CACHE_TIMEOUT'));
    var __HTTP_SERVICE_NOT_FOUND__ = Number(properties.get('global_HTTP_SERVICE_NOT_FOUND'));
    var __HTTP_UNABLE_TO_CONNECT__ = Number(properties.get('global_HTTP_SERVICE_NOT_FOUND'));
    var __HTTP_DATA_NOT_FOUND__ = Number(properties.get('global_HTTP_DATA_NOT_FOUND'));
    var __HTTP_CONNECTION_REFUSED__ = Number(properties.get('global_HTTP_CONNECTION_REFUSED'));
    var __HTTP_NOT_FOUND__ = Number(properties.get('global_HTTP_NOT_FOUND'));
    var __USERNAME__ = properties.get(reqType + '_user');
    var __PASSWORD__ = properties.get(reqType + '_password');
    var __SOURCE_URL__ = req.protocol + "://" + req.get('host') + req.originalUrl;
    var __TARGET_URL__ = properties.get(reqType + '_' + envType + '_endpoint').replace(properties.get(reqType + '_replaceString'), reqValue)
    var start = new Date();
    request.get({
      url: __TARGET_URL__,
      headers: {
        'Authorization': 'Basic ' + new Buffer.from(__USERNAME__ + ':' + __PASSWORD__).toString('base64')
      },
      gzip: true
    }, function(error, response, body) {
          if (!error && response.statusCode == __HTTP_SUCCESS__) {
            //=====================================================
            //Special Formatting Begins
            var formatterResults = jsonUtils.formatter(req, res, body);
          }else {
             if(error != null && error.toString().includes(properties.get('HTTP_CONNECTION_REFUSED_Error_Message'))){
                statusCode = __HTTP_CONNECTION_REFUSED__;
                res = header.setHeaders(res, statusCode);
                body = properties.get('eror_msg_template').replace('ENDPOINT', __SOURCE_URL__).replace('CODE', statusCode).replace('MESSAGE', properties.get(statusCode + '_msg')).replace('STATUS', properties.get(statusCode + '_msg_status'));
                zlib.gzip(body, function (_, result){
                  res.end(result);
                });
              }else if (body.includes(properties.get('global_HTTP_DATA_NOT_FOUND'))) {
                statusCode = __HTTP_DATA_NOT_FOUND__;
                res = header.setHeaders(res, statusCode);
                body = properties.get('eror_msg_template').replace('ENDPOINT', __SOURCE_URL__).replace('CODE', statusCode).replace('MESSAGE', properties.get(statusCode + '_msg')).replace('STATUS', properties.get(statusCode + '_msg_status'));
                zlib.gzip(body, function (_, result){
                  res.end(result);
                });
              }else{
                console.log("Sending Error Status: " + __HTTP_UNABLE_TO_CONNECT__);
                res = header.setHeaders(res, __HTTP_UNABLE_TO_CONNECT__);
                body = properties.get('eror_msg_template').replace('ENDPOINT', __SOURCE_URL__).replace('CODE', __HTTP_UNABLE_TO_CONNECT__).replace('MESSAGE', properties.get(__HTTP_UNABLE_TO_CONNECT__ + '_msg')).replace('STATUS', properties.get(__HTTP_UNABLE_TO_CONNECT__ + '_msg_status'));
                zlib.gzip(body, function (_, result){
                  res.end(result);
                });
            }
          }
      }
    );
  }
}

module.exports.getEndpoint = getEndpoint;
