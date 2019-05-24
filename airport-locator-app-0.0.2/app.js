var express = require('express');
var app = express();
var geocodeLocator = require('./appLocator-request');

const url = require('url');

app.get('/v2/airports', function (req, res) {
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

app.get('/v2/airports/iata/:iata_code', function (req, res) {
  console.log("\n");
  geocodeLocator.getEndpoint('iata_filter', req.params.iata_code.toUpperCase(), req, res);
})

app.get('/v2/airports/country/:country_code', function (req, res) {
  geocodeLocator.getEndpoint('country_filter', req.params.country_code.toUpperCase(), req, res);
})

var server = app.listen(8084, function () {
   console.log("Example app listening at http on tcp/8084")
})
