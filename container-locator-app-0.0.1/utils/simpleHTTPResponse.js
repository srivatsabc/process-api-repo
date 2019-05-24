var request = require('request');
let header = require('./header');
let jsonUtils = require('./jsonUtils');
var propertiesreader = require('properties-reader');
const uuidv4 = require('uuid/v4');
var dateFormat = require('dateformat');
var cache = require('memory-cache');
const zlib = require('zlib');
var promise = require('request-promise');
require('dotenv').config();

function getResponse(reqType, reqValue1, reqValue2, trackingKey, callback) {
  var properties = propertiesreader(process.env.APP_PROPERTIES);
  var __HTTP_SUCCESS__ = Number(properties.get('global_HTTP_SUCCESS'));
  var __CACHE_TIMEOUT__ = Number(properties.get(reqType + '_CACHE_TIMEOUT'));
  var __HTTP_SERVICE_NOT_FOUND__ = Number(properties.get('global_HTTP_SERVICE_NOT_FOUND'));
  var __HTTP_DATA_NOT_FOUND__ = Number(properties.get('global_HTTP_DATA_NOT_FOUND'));
  var __HTTP_CONNECTION_REFUSED__ = Number(properties.get('global_HTTP_CONNECTION_REFUSED'));
  var __HTTP_NOT_FOUND__ = Number(properties.get('global_HTTP_NOT_FOUND'));
  var __USERNAME__ = properties.get(reqType + '_user');
  var __PASSWORD__ = properties.get(reqType + '_password');
  var __TARGET_URL__ = properties.get(reqType + '_endpoint').replace(properties.get(reqType + '_replaceString1'), reqValue1).replace(properties.get(reqType + '_replaceString2'), reqValue2)
  var __CACHE_KEY__ = properties.get('global_CACHE_KEY');
  let key = __CACHE_KEY__ + __TARGET_URL__;
  var statusCode = 0;
  let cachedBody = cache.get(key)
  var body = null;
  var response = {};

  if (cachedBody){
    console.log("Responding from cache ..")
    return cachedBody;
  }else{
    console.log("Going to backend ..");
    request.get({
      url: __TARGET_URL__,
      gzip: false
    }, function(error, response, body) {
          response.trackingKey = trackingKey;
          if (!error && response.statusCode == __HTTP_SUCCESS__) {
            //=====================================================
            //console.log("body..:" + body);
            //=====================================================
            if(body.toString().length == 0){
              body = properties.get('global_HTTP_DATA_NOT_FOUND' + '_msg');
              response.body = body;
              callback(response);
            }else{
              response.body = body;
              callback(response);
            }
          }else {
             if(error != null && error.toString().includes(properties.get('HTTP_CONNECTION_REFUSED_Error_Message'))){
               body = properties.get('global_HTTP_DATA_NOT_FOUND' + '_msg');
               response.body = body;
               callback(response);
              }else{
                body = properties.get(response.statusCode + '_msg');
                response.body = body;
                callback(response);
              }
          }
      }
    );
  }
}

module.exports.getResponse = getResponse;
