const recast = require('recast')
const ObservableStore = require('obs-store')
const ComposedStore = require('obs-store/lib/composed')
const pipe = require('mississippi').pipe
const transform = require('mississippi').through.obj
const exampleSrc = require('fs').readFileSync('./example.js', 'utf8')
const renderRoot = require('./views/root')
const vdom = require('./lib/vdom')
const flattenAst = require('./lib/flattenAst')

// setup state and store

const rootStore = new ObservableStore({
  initState: {
    filename: './example.js',
    cursorIndex: 0,
    src: exampleSrc,
    ast: recast.parse(exampleSrc),
    flatAst: [],
  }
})
const astFlattener = transform((state, _, cb) => {
  // regenerate flat ast
  let flatAst = flattenAst(state.ast)
  // set node as selected
  flatAst[state.cursorIndex].selected = true
  // commit change
  state.flatAst = flatAst
  cb(null, state)
})
const tailStore = new ObservableStore()

pipe(
  rootStore,
  astFlattener,
  tailStore
)

function dispatch(action){
  let state = rootStore.getState()
  switch (action.method) {
    case 'setLiteral':
      action.nodeData.node.value = action.value
      break
    case 'setIdentifier':
      action.nodeData.node.name = action.value
      break
  }
  rootStore.putState(state)
}

// setup dom and redraw

let { rootNode, updateDom } = vdom()
document.body.appendChild(rootNode)

tailStore.subscribe((state) => {
  updateDom(renderRoot(state, dispatch))
})

// setup key bindings

window.addEventListener('keydown', (ev) => {
  // up
  if (ev.keyCode === 38) moveCursor(-1)
  // down
  if (ev.keyCode === 40) moveCursor(1)
})

function moveCursor(delta){
  let state = rootStore.getState()
  let max = state.flatAst.length - 1
  state.cursorIndex = clamp(state.cursorIndex + delta, 0, max)
  rootStore.putState(state)
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max)
}