var express = require('express');
var app = express();
var geocodeLocator = require('./appLocator-request');

const url = require('url');

app.get('/v2/container/', function (req, res) {
  console.log("\n");
  var limit = req.query.limit;
  if (isNaN(limit)) {
    limit = 1000;
  }
  if (limit <= 0){
    limit = 1000;
  }
  geocodeLocator.getEndpoint('no_filter', limit, req, res);
})

app.get('/v1/container/:shipping_no', function (req, res) {
  console.log("\n");
  geocodeLocator.getEndpoint('shipping_filter', req.params.shipping_no.toUpperCase(), req, res);
})

var server = app.listen(8083, function () {
   console.log("Example app listening at http on tcp/8083")
})
