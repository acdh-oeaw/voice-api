class XML {
  constructor(xmlData) {
    this.xmlData = xmlData;
  }
  request (type, req, res) {
    let send = {
      query: req.query,
      params: req.params,
      xmlStatus: this.xmlData.getStatus(),
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
        'header': 'header',
        'body': 'body'
      }
      if (type === 'get' && field[req.params.getType]) {
        send.xml = ''
        send.xmlType = req.params.getType
        if (dId && typeof this.xmlData.filesById[dId] === 'number') {
          let aFile = this.xmlData.files[this.xmlData.filesById[dId]]
          if (req.params.getType === 'header') {
          send.xml = aFile.xml.substr(aFile.headerStart, aFile.headerLen)
          } else if (req.params.getType === 'body') {
            send.xml = aFile.xml.substr(aFile.bodyStart, aFile.bodyLen)
          } else {
            send.xml = aFile[field[req.params.getType]]
          }
        } else {
          send.error = 'ID not found ...'
        }
      } else if (type === 'uId' && req.params.uId) {
        let uId = req.params.uId
        if (dId && typeof this.xmlData.filesById[dId] === 'number') {
          let aFile = this.xmlData.files[this.xmlData.filesById[dId]]
          if (typeof aFile.uById[uId] === 'number') {
            let aU = aFile.u[aFile.uById[uId]]
            send.u = [{uId: uId, xml: aFile.xml.substr(aU.start, aU.len)}]
          } else {
            send.error = 'ID not found in File ...'
          }
        } else if (req.params.documentId === '*') {
          let uIdList = req.params.uId.split(';')
          send.u = []
          this.xmlData.files.forEach(aFile => {
            Object.keys(aFile.uById).forEach(uId => {
              if (uIdList.indexOf(uId) > -1) {
                let aU = aFile.u[aFile.uById[uId]]
                send.u.push({uId: aU.id, xml: aFile.xml.substr(aU.start, aU.len)})
              }
            })
          })
          if (send.u.length !== uIdList.length) {
            send.error = 'Not all uIds found ...'
          }
        } else {
          send.error = 'File ID "' + req.params.documentId + '" not found ...'
        }
      }
    } else {
      send.error = 'Need Document Id ...'
    }
    res.json(send);
  }
}

module.exports = XML;
