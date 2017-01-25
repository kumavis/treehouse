const vdom = require('virtual-dom')
const h = require('virtual-hyperscript-hook')(vdom.h)
const mount = require('virtual-hyperscript-mount')()

module.exports = renderAst


let nodeRenderers = {
  File:    (state, nodeData, dispatch) =>                 h('div', `file: "${state.filename}"`),
  Program: (state, nodeData, dispatch) =>                 h('div', `prog`),
  VariableDeclaration: (state, nodeData, dispatch) =>     h('div', `${nodeData.node.kind}`),
  VariableDeclarator: (state, nodeData, dispatch) =>      h('div', `=`),
  ExpressionStatement: (state, nodeData, dispatch) =>     h('div', `#`),
  CallExpression: (state, nodeData, dispatch) =>          h('div', `()`),
  MemberExpression: (state, nodeData, dispatch) =>        h('div', `.`),
  ObjectExpression: (state, nodeData, dispatch) =>        h('div', `{}`),
  ArrowFunctionExpression: (state, nodeData, dispatch) => h('div', `=>`),
  ArrayExpression: (state, nodeData, dispatch) =>         h('div', `[]`),
  FunctionDeclaration: (state, nodeData, dispatch) =>     h('div', `λ`),
  BlockStatement: (state, nodeData, dispatch) =>          h('div', `{`),
  ReturnStatement: (state, nodeData, dispatch) =>         h('div', `<-`),
  Property: (state, nodeData, dispatch) =>                h('div', `:`),
  Identifier: (state, nodeData, dispatch) => {
    return nodeData.selected ?
      autoInput({
        value: nodeData.node.name,
        onUpdate: (value) => dispatch({
          method: 'setIdentifier',
          nodeData: nodeData,
          value: value,
        })
      })
      : h('.bold', `${nodeData.node.name}`)
  },
  Literal: (state, nodeData, dispatch) => {
    return nodeData.selected ?
      autoInput({
        value: nodeData.node.value,
        onUpdate: (value) => dispatch({
          method: 'setLiteral',
          nodeData: nodeData,
          value: value,
        })
      })
    : h('div', `${nodeData.node.value}`)
  },
}

function autoInput(opts) {
  return h('input', {
    type: 'text',
    // auto focus
    hook: mount((el) => {
      el.value = opts.value
      setTimeout(() => { if (el) el.focus() })
    }),
    oninput: (event) => opts.onUpdate(event.target.value),
  })
}

function renderAst(state, dispatch){
  return state.flatAst.map((nodeData) => {
    return renderNodeData(state, nodeData, dispatch)
  })
}

function renderNodeData(state, nodeData, dispatch){
  let nodeRenderer = getRendererForType(nodeData.node.type)
  let classNames = ['ast-node', nodeData.selected && 'ast-selected']
  let selector = '.'+classNames.filter(Boolean).join('.')
  return (

    h(selector, {
      style: {
        paddingLeft: (12 * nodeData.depth)+'px',
      }
    }, [
      nodeRenderer(state, nodeData, dispatch)
    ])

  )
}

function getRendererForType(type){
  return nodeRenderers[type] || renderUnknown
}

function renderUnknown(state, nodeData, dispatch){
  return (

    h('.ast-node.ast-unknown', [
      `Unknown node type: ${nodeData.node.type}`,
      renderDebugObject(nodeData.node),
    ])

  )
}

function renderDebugObject(obj){
  return Object.keys(obj).map((key) => {
    let value = obj[key]
    return h('div', `${key}: ${value}`)
  })
}
