class XML {
  constructor(xmlData) {
    this.xmlData = xmlData;
  }
  getStatus () {
    if (this.xmlData.loaded) {
      return {
        ok: this.xmlData.errors.length < 1,
        errors: this.xmlData.errors
      }
    } else {
      return {
        ok: false,
        errors: this.xmlData.errors,
        status: this.xmlData.files.length < 1 ?
          'Loading Directory' :
          parseInt(String(100 / this.xmlData.files.length * this.xmlData.files.filter(f => f.loaded).length)) + ' %'
      }
    }
  }
  request (type, req, res) {
    let send = {
      query: req.query,
      xmlStatus: this.getStatus(),
    }
    if (type === 'overview') {
      send.allXmlIds = []
      this.xmlData.files.forEach((uObj, idx) => {
        send.allXmlIds.push(uObj.id)
      });
    } else if ((type === 'get' || type === 'uId') && req.params && req.params.documentId) {
      let dId = req.params.documentId
      send.xmlId = dId
      let field = {
        'file': 'xml',
        'header': 'header'
      }
      if (type === 'get' && field[req.params.getType]) {
        send.xml = ''
        send.xmlType = req.params.getType
        if (dId && typeof this.xmlData.filesById[dId] === 'number') {
          send.xml = this.xmlData.files[this.xmlData.filesById[dId]][field[req.params.getType]]
        } else {
          send.error = 'ID not found ...'
        }
      } else if (type === 'uId' && req.params.uId) {
        let uId = req.params.uId
        if (dId && typeof this.xmlData.filesById[dId] === 'number') {
          if (typeof this.xmlData.files[this.xmlData.filesById[dId]].uById[uId] === 'number') {
            send.u = [{uId: uId, xml: this.xmlData.files[this.xmlData.filesById[dId]].u[this.xmlData.files[this.xmlData.filesById[dId]].uById[uId]].xml}]
          } else {
            send.error = 'ID not found in File ...'
          }
        } else {
          send.error = 'File ID not found ...'
        }
      }
    }
    res.json(send);
  }
}

module.exports = XML;
