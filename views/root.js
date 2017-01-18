const h = require('virtual-dom/virtual-hyperscript')

module.exports = function(state, prev, send) {
  return (

    h('div', [
      h('style', getStyle()),
      
      h('div', `${state.cursorIndex}: ${state.flatAst[state.cursorIndex].selected}`),
      h('div', renderAst(state)),
    ])

  )
}

function getStyle(){
  return `
  .ast-node {
    // border: 1px solid black;
  }
  .ast-unknown {
    border: 1px solid pink;
  }

  .ast-selected {
    background: gray;
  }

  .bold {
    font-weight: bold;
  }
  `
}

function renderAst(state){
  return state.flatAst.map((nodeData) => {
    return renderNodeData(state, nodeData)
  })
}

function renderNodeData(state, nodeData){
  let nodeRenderer = getRendererForType(nodeData.node.type)
  let classNames = ['ast-node', nodeData.selected && 'ast-selected']
  let selector = '.'+classNames.filter(Boolean).join('.')
  return (

    h(selector, {
      style: {
        paddingLeft: (12 * nodeData.depth)+'px',
      }
    }, [
      nodeRenderer(state, nodeData)
    ])

  )
}

let nodeRenderers = {
  File:    (state, nodeData) =>                 h('div', `file: "${state.filename}"`),
  Program: (state, nodeData) =>                 h('div', `prog`),
  VariableDeclaration: (state, nodeData) =>     h('div', `${nodeData.node.kind}`),
  VariableDeclarator: (state, nodeData) =>      h('div', `=`),
  Identifier: (state, nodeData) =>              h('.bold', `${nodeData.node.name}`),
  ExpressionStatement: (state, nodeData) =>     h('div', `()`),
  CallExpression: (state, nodeData) =>          h('div', `call`),
  MemberExpression: (state, nodeData) =>        h('div', `.`),
  ObjectExpression: (state, nodeData) =>        h('div', `{}`),
  ArrowFunctionExpression: (state, nodeData) => h('div', `=>`),
  ArrayExpression: (state, nodeData) =>         h('div', `[]`),
  Literal: (state, nodeData) =>                 h('div', `${nodeData.node.raw}`),
  FunctionDeclaration: (state, nodeData) =>     h('div', `λ`),
  BlockStatement: (state, nodeData) =>          h('div', `{`),
  ReturnStatement: (state, nodeData) =>         h('div', `<-`),
}

function getRendererForType(type){
  return nodeRenderers[type] || renderUnknown
  // switch(type) {
  //   case 'Program':
  //     return renderProgram
  //   case 'VariableDeclarator':
  //     return renderVariableDeclarator
  //   default:
  //     return renderUnknown
  // }
}

function renderUnknown(state, nodeData){
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

function flattenAst(node, depth = 0, nodes = []){
  let nodeData = { node, depth }
  nodes.push(nodeData)
  switch(node.type) {
    case 'File':
      furtherFlatten([node.program])
      break
    case 'Program':
      furtherFlatten(node.body)
      break
    case 'VariableDeclaration':
      furtherFlatten(node.declarations)
      break
    case 'VariableDeclarator':
      furtherFlatten([node.id, node.init])
      break
    case 'CallExpression':
      furtherFlatten([node.callee])
      furtherFlatten(node.arguments)
      break
    case 'ExpressionStatement':
      furtherFlatten([node.expression])
      break
    case 'FunctionDeclaration':
      furtherFlatten([node.id])
      furtherFlatten(node.params)
      furtherFlatten([node.body])
      break
    case 'ArrowFunctionExpression':
      furtherFlatten(node.params)
      furtherFlatten([node.body])
      break
    case 'ArrayExpression':
      furtherFlatten(node.elements)
      break
    case 'BlockStatement':
      furtherFlatten(node.body)
      break
    case 'MemberExpression':
      furtherFlatten([node.object, node.property])
      break
    case 'ReturnStatement':
      furtherFlatten([node.argument])
      break
    
  }
  return nodes

  function furtherFlatten(children){
    children.forEach((child) => flattenAst(child, depth + 1, nodes))
  }
}