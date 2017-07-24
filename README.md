# Hotloader

Simple module to enable hot reloading of html. Using a virtual DOM, hotloader updates the DOM without page reloads.

Hotloader does not care how these html files are created.

## API

### `initializeHotloader(listener)`

creates an instance of hotloader

#### arguments

  1. `listener`, a HTTP server. This gets passed into socket.io. See the [socket.io docs](https://socket.io/docs/) for more information.

#### returns

`hotloader`: An instance of hotloader.

### `hotloader` methods

### `registerView(watchFiles, getHtml, onHotloaderReady)`

#### arguments

  1. `watchFiles`, (string or array of strings). Paths to files, dirs to be watched recursively, or glob patterns. See the watch method in the [chokidar docs](https://github.com/paulmillr/chokidar#api) for more detail. Change events on watched files cause the hotloader to update the page.
  2. `getHtml`, (function). Takes a single callback argument. You should pass html into this function as the second argument. This will be called whenever a change is detected, as well as to fetch the initial html. You can pass in static files, or  html generated from a template engine.
  3. `onHotloaderReady`, (function). receives an error and html as arguments. The html should be served to the client, hotloader will do the rest from there.

## example

```js
const http = require('http')
const path = require('path')
const fs = require('fs')
const initHotloader = require('hotloader')

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
```


## Projects that use Hotloader

Rather than use this module directly, this should be used to create middleware / plugins to enable hotloading of html.

  1. [express-engine-hotloader](express-engine-hotloader)

more coming soon ...


##### Made with :heart: by [des-des](https://github.com/des-des)

###### Contributions welcome :sparkles:
