class search {
  constructor(xmlData) {
    this.xmlData = xmlData;
  }
  request (req, res) {
    console.log(req.url, req.query, this);
    res.send('search - ' + JSON.stringify(req.query));
  }
}

module.exports = search;
