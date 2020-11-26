var express = require('express');
var xml = require('./xml/xml.js')
var search = require('./search/search.js')
var cors = require('cors')

const {
  PORT
} = process.env

const port = PORT || 3000;

var xmlObj = new xml();
var app = express();

app.use(cors());

app.get('/', function(req, res) {
  res.send("nix");
});

app.get('/xml/', function(req, res) {
  xmlObj.request('overview', req, res);
});
app.get('/xml/:documentId/:getType', function(req, res) {
  xmlObj.request('get', req, res);
});
app.get('/xml/:documentId/uid/:uId', function(req, res) {
  xmlObj.request('uId', req, res);
});

app.get('/search', function(req, res) {
  new search(req, res);
});

console.log(`Started on port ${port}`);
app.listen(port);
