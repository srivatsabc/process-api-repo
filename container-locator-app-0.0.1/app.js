var express = require('express');
const bodyParser = require('body-parser');
var geocodeLocator = require('./appLocator-request');
var geocodeLocator_1 = require('./appLocator-request_1');
const url = require('url');
var app = express();

app.use(bodyParser.urlencoded({
  extended: true
}))

app.use(bodyParser.json())

app.get('/v1/container/:shipping_no', function (req, res) {
  console.log("\n");
  geocodeLocator.getEndpoint('shipping_filter', req.params.shipping_no.toUpperCase(), req, res);
})

app.post('/v1/container/dispatch', function (req, res) {
  console.log("\n");
  geocodeLocator_1.getEndpoint('dispatch_filter', "", req, res);
})

var server = app.listen(8073, function () {
   console.log("Example app listening at http on tcp/8073")
})
