var JSONPARSER = require('json-parser');
var JSONIFY = require('json-stringify');
var propertiesreader = require('properties-reader');
var simpleHTTP = require('./simpleHTTPResponse');
require('dotenv').config();
const zlib = require('zlib');
let header = require('./header');
var cache = require('memory-cache');
let {PythonShell} = require('python-shell');
const uuidv4 = require('uuid/v4');

function formatter (req, res, body) {
  //=====================================================
  //Contains special formatting requirements specific to that API
  //=====================================================
  var properties = propertiesreader(process.env.APP_PROPERTIES);
  var __CACHE_KEY__ = properties.get('global_CACHE_KEY');
  let key = __CACHE_KEY__ + req.originalUrl || req.url;
  var __HTTP_DATA_NOT_FOUND__ = Number(properties.get('global_HTTP_DATA_NOT_FOUND'));
  var __HTTP_SUCCESS__ = Number(properties.get('global_HTTP_SUCCESS'));
  var result = {};
  var jsonResult = {};
  var jsonKey = 'results';
  //var jsonLocationKey = 'productLocation';
  jsonResult[jsonKey] = [];
  var locationName = {};
  var jsonParsedResult = JSON.parse(body);
  var jsonParsedResponseCount = 0;
  var gmapLatitudeList = [];
  var gmapLongitudeList = [];
  var startLatitude = null;
  var startLongitude = null;
  result.length = jsonParsedResult.result.toString().length;
  if (result.length != 0){
    result.responseCode = __HTTP_SUCCESS__;
    var productLocationArrLength = jsonParsedResult.result.productLocation.length;
    var jsonProductLocationResult = {};
    jsonProductLocationResult = [];
    console.log("productLocationArrLength: " + productLocationArrLength);
    for(var i = 0; i < productLocationArrLength; i++) {
      console.log("lat: " + jsonParsedResult.result.productLocation[i].lastKnownLocationLatitude);
      var latitude = jsonParsedResult.result.productLocation[i].lastKnownLocationLatitude;
      console.log("long: " + jsonParsedResult.result.productLocation[i].lastKnownLocationLongitude);
      var longitude = jsonParsedResult.result.productLocation[i].lastKnownLocationLongitude;
      gmapLatitudeList[i] = parseFloat(latitude);
      gmapLongitudeList[i] = parseFloat(longitude);
      if(i == 0){
        startLatitude = parseFloat(latitude);
        startLongitude = parseFloat(longitude);
      }
      var reqType = 'address_filter';
      var trackingKey = latitude + "_" + longitude;
      console.log("sending: " + trackingKey);
      simpleHTTP.getResponse(reqType, latitude, longitude, trackingKey, function(response) {
        var jsonParsedResponse = JSONPARSER.parse(response.body);
        var __CACHE_TIMEOUT__ = Number(properties.get(reqType + '_CACHE_TIMEOUT'));
        locationName[response.trackingKey] = jsonParsedResponse.display_name;
        console.log("body >> " + jsonParsedResponse.display_name + " count: " + jsonParsedResponseCount + " key: " + response.trackingKey);

        if (jsonParsedResponseCount == productLocationArrLength-1){
          for(var i = 0; i < productLocationArrLength; i++) {
            var locationNameVal = locationName[jsonParsedResult.result.productLocation[i].lastKnownLocationLatitude + "_" + jsonParsedResult.result.productLocation[i].lastKnownLocationLongitude];
            if (locationNameVal == null){
              locationNameVal = "";
            }
            console.log("inside >> key: " + jsonParsedResult.result.productLocation[i].lastKnownLocationLatitude + "_" + jsonParsedResult.result.productLocation[i].lastKnownLocationLongitude + " Data: " + locationNameVal);
            var productLocationData = {
              containerID: jsonParsedResult.result.productLocation[i].containerID,
              containerName: jsonParsedResult.result.productLocation[i].containerName,
              lastKnownLocationLatitude: jsonParsedResult.result.productLocation[i].lastKnownLocationLatitude,
              lastKnownLocationLongitude: jsonParsedResult.result.productLocation[i].lastKnownLocationLongitude,
              locationName: locationNameVal,
              lastKnownLocationDateTime: jsonParsedResult.result.productLocation[i].lastKnownLocationDateTime,
              status: jsonParsedResult.result.productLocation[i].status
            }
            jsonProductLocationResult.push(productLocationData);
          }
          var jsonData = {
            productID: jsonParsedResult.result.productID,
            productName: jsonParsedResult.result.productName,
            shippingID: jsonParsedResult.result.shippingID,
            productionLocation: jsonProductLocationResult,
          };
          jsonResult[jsonKey].push(jsonData);
          result.formattedBody = JSONIFY(jsonResult);

          if(result.length == 0){
            statusCode = __HTTP_DATA_NOT_FOUND__;
            body = properties.get('eror_msg_template').replace('ENDPOINT', __SOURCE_URL__).replace('CODE', statusCode).replace('MESSAGE', properties.get(statusCode + '_msg')).replace('STATUS', properties.get(statusCode + '_msg_status'));
            res = header.setHeaders(res, statusCode);
            zlib.gzip(body, function (_, result){
              res.end(result);
            });
          }else{
            var mapRequired = req.query.map;
            if (mapRequired == null) {
              mapRequired = 'FALSE'
            }
            if(mapRequired.toUpperCase() === 'TRUE'){
              mapName = uuidv4() + ".html";
              let options = {
                mode: 'text',
                pythonPath: 'C:/Python27/python',
                pythonOptions: ['-u'], // get print results in real-time
                scriptPath: __dirname,
                args: [gmapLatitudeList, gmapLongitudeList, startLatitude, startLongitude, __dirname + "/" + mapName]
              };
              PythonShell.run('mapGenerator.py', options, function (err, results) {
                if (err){
                  console.log("Failed to generate map");
                  throw err;
                }else{
                  console.log('results: %j', results);
                  res.sendFile(__dirname + "/" + mapName);
                }
              });
            }else{
              res = header.setHeaders(res, __HTTP_SUCCESS__);
              zlib.gzip(result.formattedBody, function (_, result){
                //res.setHeader('Content-disposition', 'attachment; filename="C:/Srivatsa/17. CloudAPIs/k8s/apis/process-api-ns/Node.js/container-locator-app-0.0.1/map10.html"');
                res.end(result);
                cache.put(key, result, __CACHE_TIMEOUT__);
              });
            }

          }
        }
        jsonParsedResponseCount++;
      });
    }
  }else{
    result.responseCode = __HTTP_DATA_NOT_FOUND__;
    console.log("responseCode: " + result.responseCode);
    return result;
  }
  console.log("End jsonUtils");
}

module.exports.formatter = formatter;
