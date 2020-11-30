var fs = require("fs");
const cheerio = require('cheerio');

const xmlFilesDirectory = './xmlfiles'

class XMLData {
    constructor() {
      this.files = [];
      this.filesById = {};
      this.loaded = false;
      this.errors = [];
      this.init();
    }
    init () {
      console.log('Init XML');
      console.log('Read "xmlfiles"-Directory');
      fs.readdir(xmlFilesDirectory, (err, files) => {
        this.files = files.filter(f => typeof f === 'string' && f.toLowerCase().split('.').pop() === 'xml').map( fn => {
          return {
            filename: fn,
            id: null,
            xml: '',
            header: '',
            u: [],
            uById: {},
            loaded: false
          }
        });
        this.loadFile();
      });
    }
    getStatus () {
      if (this.loaded) {
        return {
          ok: this.errors.length < 1,
          errors: this.errors
        }
      } else {
        return {
          ok: false,
          errors: this.errors,
          status: this.files.length < 1 ?
            'Loading Directory' :
            parseInt(String(100 / this.files.length * this.files.filter(f => f.loaded).length)) + ' %'
        }
      }
    }
    unleak (string) {
      return (' ' + string).substr(1)
    }
    loadFile () {
      let unloadedFiles = this.files.filter(f => !f.loaded)
      if (unloadedFiles.length > 0) {
        let aFileObj = unloadedFiles[0]
        console.log('Load File - ' + aFileObj.filename)
        fs.readFile(xmlFilesDirectory + '/' + aFileObj.filename, {encoding: 'utf8'}, (err, data) => {
          if (err) {
            this.errors.push({ func: 'loadFile', err: String(err) });
            console.log(String(err));
          } else {
            aFileObj.xml = data
            let aDom = cheerio.load(data, {xmlMode: true}); 
            // still <pause/> and others will be <pause></pause>
            aFileObj.id = this.unleak(aDom('TEI')[0].attribs['xml:id']);
            aFileObj.header = this.unleak(cheerio.html(aDom('teiHeader')));
            let u = aDom('u')
            u.each(uIdx => {
              aFileObj.u.push({
                id: this.unleak(u[uIdx].attribs['xml:id']),
                xml: this.unleak(cheerio.html(u[uIdx]))
              })
            })
            aFileObj.u.forEach((uObj, idx) => {
              aFileObj.uById[uObj.id] = idx
          });
          this.filesById[aFileObj.id] = this.files.indexOf(aFileObj)
            aFileObj.loaded = true;
            // console.log(xmlFilesDirectory + '/' + aFileObj.filename, err, data.length);
            this.loadFile();
          }
        })
      } else {
      this.filesById = {}
        this.files.forEach((uObj, idx) => {
          this.filesById[uObj.id] = idx
        });
        console.log('Load File - All Files loaded ...')
        this.loaded = true
      }
    }
}

module.exports = XMLData;