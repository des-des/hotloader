const virtualize = require('snabbdom-virtualize').default
const patch = require('snabbdom').init([
  require('snabbdom/modules/class').default,
  require('snabbdom/modules/props').default,
  require('snabbdom/modules/attributes').default,
  require('snabbdom/modules/style').default,
  require('snabbdom/modules/eventlisteners').default
])
const h = require('snabbdom/h').default
const io = require('socket.io-client')

/* global HOTLOADER_CLIENT_ID location */

const findBody = htmlVNode => {
  const { children } = htmlVNode
  const expectedBody = children[children.length - 1]
  return expectedBody.sel === 'body' && expectedBody
}

const hotloader = () => {
  console.log('Starting hotloader')
  const self = {}

  document.body.innerHTML = ''

  let vNode = patch(
    document.body,
    h('body', {})
  )

  const recieveUpdate = html => {
    if (!html) throw new Error('got empty html!')
    const newVNode = findBody(virtualize(html))

    if (newVNode) {
      vNode = patch(vNode, virtualize(html))
      window.focus()
    }
  }
  self.recieveUpdate = recieveUpdate

  return self
}

window.addEventListener('DOMContentLoaded', () => {
  const socket = io()
  const loader = hotloader()

  socket.on('connect', () => {
    socket.emit('register', HOTLOADER_CLIENT_ID)
  })

  socket.on('html', loader.recieveUpdate)

  socket.on('refresh', () => { location.reload() })
})
