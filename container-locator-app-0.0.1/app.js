var express = require('express');
var app = express();
var geocodeLocator = require('./appLocator-request');
const url = require('url');

app.get('/v1/container/:shipping_no', function (req, res) {
  console.log("\n");
  geocodeLocator.getEndpoint('shipping_filter', req.params.shipping_no.toUpperCase(), req, res);
})

var server = app.listen(8073, function () {
   console.log("Example app listening at http on tcp/8073")
})
