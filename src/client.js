/* global HOTLOADER_CLIENT_ID location */

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

const findBody = htmlVNode => {
  const { children } = htmlVNode
  const expectedBody = children[children.length - 1]
  return expectedBody.sel === 'body' && expectedBody
}

const handleError = html => (msg, e) => {
  console.error([
    msg,
    'Rebuilding entire page',
    'Error message: ' + e.message
  ].join('\n'))

  document.documentElement.innerHTML = html
  document.getElementsByTagName('body')[0].focus()
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
    if (!html) return

    const fallback = handleError(html)

    let newVNode

    try {
      newVNode = virtualize(html)
    } catch (e) {
      return fallback('Failed to virtualize incoming html.', e)
    }

    try {
      vNode = patch(vNode, findBody(newVNode))
    } catch (e) {
      return fallback('Patching DOM failed.', e)
    }

    // hack for chrome, force repaint on unfocused window.
    document.getElementsByTagName('body')[0].focus()
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
