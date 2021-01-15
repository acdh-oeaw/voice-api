# voice-clariah-node-api

### xml

```text
/xml/ - List Ids
/xml/LEcon329/file - Get XML-File
/xml/LEcon329/header - Get TEI Header
/xml/LEcon329/body - Get TEI Body
/xml/LEcon329/uid/LEcon329_u_15 - Get u-Tag
```

### Dev

```bash
nodemon --inspect app.js
```

### Local testing

To make sure your tests run in the AutoDevOps pipline you can test the test stage locally using your own docker instance like this

```bash
docker run --rm -v $(pwd):/tmp/app gliderlabs/herokuish /bin/herokuish buildpack test
```

```powershell
docker run --rm -v ${PWD}:/tmp/app gliderlabs/herokuish /bin/herokuish buildpack test
```
