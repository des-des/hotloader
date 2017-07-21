const hapi = require('hapi')
const inert = require('inert')
const path = require('path')
const fs = require('fs')

const initHotloader = require('../')

const server = new hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: path.join(__dirname, 'public')
      }
    }
  }
})

server.connection({ port: 3000 })

const hotloader = initHotloader(server.listener)

server.register(inert, () => {})

server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true,
      index: true
    }
  }
})

const readIndex = cb =>
  fs.readFile(path.join(__dirname, 'index.html'), 'utf8', cb)

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    const filePath = path.join(__dirname, 'index.html')
    hotloader.registerView(
      filePath,
      readIndex,
      reply
    )
  }
})

server.start((err) => {
  if (err) {
    throw err;
  }

  console.log('Server running at:', server.info.uri);
});
