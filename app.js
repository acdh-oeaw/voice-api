const express = require('express');
const xmlData = require('./xml/xmlData.js')
const xml = require('./xml/xml.js')
const search = require('./search/search.js')
const cors = require('cors')

const {
  PORT
} = process.env

const port = PORT || 3000;

const xmlDataObj = new xmlData()
var xmlObj = new xml(xmlDataObj);
var searchObj = new search(xmlDataObj);
var app = express();

app.use(cors());

app.get('/', function(req, res) {
  res.send("{{semverString}}");
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
  searchObj.request(req, res);
});

console.log(`Started on port ${port}`);
app.listen(port);
