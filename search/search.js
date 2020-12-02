const https = require('https');
const http = require('http');
// const cheerio = require('cheerio');
const { performance } = require('perf_hooks');
const {
  NOSKE_BONITO
} = process.env
const noske_bonito = NOSKE_BONITO || 'https://voice-noske.acdh-dev.oeaw.ac.at/bonito/run.cgi'

class search {
  constructor(xmlData) {
    this.xmlData = xmlData;
  }
  request (req, res) {
    /* don't forget to use these with .clone()! */
  //   const matchTag = cheerio('<exist:match></exist:match>');
  //   const namespacesWrap = cheerio(`<_ xmlns:exist="http://exist.sourceforge.net/NS/exist"
  // xmlns:voice="http://www.univie.ac.at/voice/ns/1.0"
  // xmlns="http://www.tei-c.org/ns/1.0"></_>`);
    let send = {
      query: req.query,
      xmlStatus: this.xmlData.getStatus(),
    }
    // console.log(req.url, req.query, this);
    // var t1 = performance.now()
    this.getJson(noske_bonito + '/first?corpname=voice&queryselector=iqueryrow&iquery='
     + (req.query.q || '') +
    '&attrs=wid&kwicleftctx=0&kwicrightctx=0&refs=u.id,doc.id&pagesize=100000',
    (json) => {
        let docsUandIDs = {}
        // console.log(json)
        if (!json.Lines) {
            send.NoSkEError = json;
            res.status(500).json(send)            
            return
          }
        json.Lines.map((line) => {
          const key = line.Refs.map((ref) => {return ref.split('=')[1]}).join();
          const val = docsUandIDs[key] || [];        
          docsUandIDs[key] = val.concat(line.Kwic[0].str.split(' '))
        })
        if (!this.xmlData.loaded) {
          send.error = "not all XML loaded";
          res.status(500).json(send);             
             return
          }
        send.u = [];
        // var t2 = performance.now()
        for (let uDoc of Object.keys(docsUandIDs)) {
          const uDocVals = uDoc.split(',')
          const docNum = this.xmlData.filesById[uDocVals[1]]
          const uNum = this.xmlData.files[docNum].uById[uDocVals[0]]
          // const u = this.xmlData.files[docNum].u[uNum]
          // const aDom = cheerio.load(u.xml, {xmlMode: true})
          // const xmlIDs = '[xml\\:id = "' + docsUandIDs[uDoc].join('"], [xml\\:id = "') + '"]'
          // const uElements = aDom(xmlIDs)
          // console.log(uDoc, xmlIDs)
          // uElements.each((_, el) => {cheerio(el).replaceWith(cheerio(el).wrap(matchTag.clone()))})
          send.u.push({
            xmlId: uDocVals[1],
            uId: uDocVals[0],
            // xml: aDom.html(),
            xml: this.xmlData.files[docNum].u[uNum].xml,
            highlight: docsUandIDs[uDoc]
          })
        }
        // console.log('search - noske:', t2 - t1, 'xml', performance.now() - t2)
        res.json(send);
    }).on('error', (e) => {
      console.error(`Got error: ${e.message}`);
      send.error = e.message;
      res.status(500).json(send);
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
