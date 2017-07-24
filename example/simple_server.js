const http = require('http')
const path = require('path')
const fs = require('fs')
const initHotloader = require('../')

const router = (request, response) => {
  const ext = request.url.split('.')[1]
  if (ext === 'html')
    return htmlHandler(request, response)

  response.end('not found')
}

const server = http.createServer(router)

const hotloader = initHotloader(server)

const htmlHandler = (request, response) => {
  const filePath = path.join(__dirname, request.url)
  const readFile = cb => fs.readFile(filePath, cb)
  const sendHtml = (_, html) => response.end(html)

  if (process.env.NODE_ENV === 'development')
    return hotloader.registerView(
      filePath,                    // watch this file
      readFile,                    // get its contents when it changes
      sendHtml                     // respond with hotloader when ready
    )

  readFile(sendHtml)
}

server.listen(4000, () => { console.log('listening on 4000') })
