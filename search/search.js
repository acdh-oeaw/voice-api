const https = require('https');
const http = require('http');
const cheerio = require('cheerio');
const {
  NOSKE_BONITO
} = process.env
const noske_bonito = NOSKE_BONITO || 'https://voice-noske.acdh-dev.oeaw.ac.at/bonito/run.cgi'

class search {
  constructor(xmlData) {
    this.xmlData = xmlData;
  }
  request (req, res) {
    console.log(req.url, req.query, this);
    this.getJson(noske_bonito + '/first?corpname=voice&queryselector=iqueryrow&iquery='
     + (req.query.q || '') +
    '&attrs=wid&kwicleftctx=0&kwicrightctx=0&refs=u.id,doc.id&pagesize=100000',
    (json) => {
        let docsUandIDs = {}
        let results = []
        if (!json.Lines) {
          res.status(500)
             .header('Content-Type', 'application/json')
             .send(JSON.stringify(json));             
             return
          }
        json.Lines.map((line) => {
          const key = line.Refs.map((ref) => {return ref.split('=')[1]}).join();
          const val = docsUandIDs[key] || [];        
          docsUandIDs[key] = val.concat(line.Kwic[0].str.split(' '))
        })
        if (!this.xmlData.loaded) {
          res.status(500)
             .header('Content-Type', 'application/json')
             .send('{"error": "not all XML loaded"}');             
             return
          }
        for (let uDoc of Object.keys(docsUandIDs)) {
          const uDocVals = uDoc.split(','),
                docNum = this.xmlData.filesById[uDocVals[1]],
                uNum = this.xmlData.files[docNum].uById[uDocVals[0]],
                u = this.xmlData.files[docNum].u[uNum],
                aDom = cheerio.load(u.xml, {xmlMode: true}),
                xmlIDs = '[xml\\:id = "' + docsUandIDs[uDoc].join('"], [xml\\:id = "') + '"]',
                uElements = aDom(xmlIDs),
                matchTag = cheerio('<exist:match></exist:match>');
          uElements.each((_, el) => {cheerio(el).replaceWith(cheerio(el).wrap(matchTag))})
          results.push(aDom.html())
        }
        res.header('Content-Type', 'application/xml')
           .send(results.join('\n'));
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
      res.send('{"error": "' + `Got error: ${e.message}` + '"}')
    });
  }
  getJson(url, cb) {
    const client = noske_bonito.startsWith('https') ? https : http
    const clientOptions = noske_bonito.startsWith('https') ? {rejectUnauthorized: false} : {}
    // pretty much the boiler plate code from nodejs.org docs.
    return client.get(url, clientOptions, function(res) {
      const { statusCode } = res;
      const contentType = res.headers['content-type'];
    
      let error;
      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          `Expected application/json but received ${contentType}`);
      }
      if (error) {
        // Consume response data to free up memory
        res.resume();
        this.emit('error', error)
        return
      }
    
      res.setEncoding('utf8');
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        const parsedData = JSON.parse(rawData);
        cb(parsedData)
      });
    })
  }
}

module.exports = search;
