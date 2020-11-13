var express = require('express');
var xml = require('./xml/xml.js')
var search = require('./search/search.js')
var xmlObj = new xml();

var app = express();

app.get('/', function(req, res) {
  res.send("nix");
});

app.get('/xml', function(req, res) {
  xmlObj.request(req, res);
});

app.get('/search', function(req, res) {
  new search(req, res);
});

app.listen(8000);
