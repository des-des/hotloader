const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')
const socketio = require('socket.io')

const hotLoaderClientHtml =
  fs.readFileSync(path.join(__dirname, 'client.js'), 'utf8')

const generateId = (i => () => { return i++ })(0)

const injectHotloader = (html, clientId) => {
  const re = /<\/body>/g
  re.exec(html)
  const i = re.lastIndex
  if (i === 0) {
    console.warn('failed in init hotloader, no body closing tag found')
    return html
  }
  return `
    ${html.slice(0, i - 7)}
    <script type="text/javascript">
      ${hotLoaderClientHtml}
    </script>
    <script type="text/javascript">
      console.log('setting HOTLOADER_CLIENT_ID to ', ${clientId})
      var HOTLOADER_CLIENT_ID = ${clientId}
    </script>
    ${html.slice(i - 7)}
  `
}

const emitHtml = (socket, getHtml) => {
  getHtml((err, html) => {
    if (err) return console.error(err)
    socket.emit(
      'html',
      html
      .split('\n')
      .slice(1)
      .join('\n')
    )
  })
}

const hotloader = listener => {
  const self = {}

  const hotloaders = {}
  const io = socketio(listener)

  io.on('connection', socket => {
    socket.on('register', clientId => {
      if (!hotloaders[clientId]) {
        return socket.emit('refresh')
      }

      const { getHtml, watchFiles } = hotloaders[clientId]

      emitHtml(socket, getHtml)

      const watcher = chokidar.watch(watchFiles).on('change', file => {
        emitHtml(socket, getHtml)
      })

      socket.on('disconnect', () => {
        watcher.close()
      })
    })
  })
  const registerView = (watchFiles, getHtml, cb) => {
    const clientId = generateId()
    hotloaders[clientId] = { getHtml, watchFiles }

    getHtml((err, html) => {
      if (err) return cb(err)

      cb(null, injectHotloader(html, clientId))
    })
  }
  self.registerView = registerView

  return self
}

module.exports = hotloader
