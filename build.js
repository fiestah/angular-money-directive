var jade = require('jade')
var fs = require('fs')

const LATEST = '1.2.0'
const SRC_FILE = 'demo.jade'

var jadeFn = jade.compileFile(SRC_FILE)

var pages = [
  {
    filename: 'index.html',
    angular: '1.4.7',
    release: LATEST,
  },
  {
    filename: '1.3.html',
    angular: '1.3.20',
    release: LATEST,
  },
  {
    filename: '1.2.html',
    angular: '1.2.29',
    release: '1.1.1',
  },
]

pages.forEach(page => {
  var html = jadeFn({
    currentPage: page,
    pages: pages
  })

  fs.writeFile(page.filename, html)
})
