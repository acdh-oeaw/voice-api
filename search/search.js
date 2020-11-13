class search {
  constructor(req, res) {
    this.loaded = false;
    this.request(req, res);
  }
  request (req, res) {
    console.log(req.url, req.query, this);
    res.send('search - ' + JSON.stringify(req.query));
  }
}

module.exports = search;
