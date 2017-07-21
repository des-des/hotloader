# Hotloader

simple module to enable hot reloading of html. Using a virtual DOM, hotloader diffs changes and mutates the dom. Initial html calls get injected with a socket and hotloading functionality.

hotloader does not care how these html files are created.

## example

A full example for hapijs is in the examples folder.

### express

```js
const getIndex = cb => fs.readFile('index.html', cb)

// without hotloader
(res, res) => {
  getIndex((_, index) => {
    res.send(index)
  })
}

// with hotloader
(res, res) => {
  hotloader.registerView(
    'index.html',
    getIndex,
    (_, html) => res.send(html)
  )
}
```

## API

```js
const hotloader = require('hotloader')(server.listener)

hotloader.registerView(
  watchFiles,
  getHtml,
  callback
)

```

The register view function takes 3 arguments
  1. Watch files: passed directly into [chokidar.watch](https://github.com/paulmillr/chokidar). When these files change the page will be updated
  2. getHtml((err, html)), takes a callback, should pass html representing the page being served. This will be called on when file changes are detected
  3. callback. This gets called after register view has finished setting up, as a second argument it will contain the html file that need to be served.

Right now this is experimental. Only use in development.

Rather than for use directly, this should be used to create middleware / plugins (coming soon) to enable hotloading of html..

contributions welcome :)
