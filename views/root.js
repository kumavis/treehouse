const h = require('virtual-dom/virtual-hyperscript')

module.exports = function(state, prev, send) {
  return (

    h('div', [
      h('style', getStyle()),
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

  .bold {
    font-weight: bold;
  }
  `
}

function renderAst(state){
  let flatNodeData = flattenAst(state.ast.program)
  return flatNodeData.map(renderNodeData)
}

function renderNodeData(nodeData){
  let nodeRenderer = getRendererForType(nodeData.node.type)
  return (

    h('.ast-node', {
      style: {
        paddingLeft: (12 * nodeData.depth)+'px',
      }
    }, [
      nodeRenderer(nodeData)
    ])

  )
}

let nodeRenderers = {
  Program: (nodeData) =>                 h('div', `prog`),
  VariableDeclaration: (nodeData) =>     h('div', `${nodeData.node.kind}`),
  VariableDeclarator: (nodeData) =>      h('div', `=`),
  Identifier: (nodeData) =>              h('.bold', `${nodeData.node.name}`),
  ExpressionStatement: (nodeData) =>     h('div', `()`),
  CallExpression: (nodeData) =>          h('div', `call`),
  MemberExpression: (nodeData) =>        h('div', `.`),
  ObjectExpression: (nodeData) =>        h('div', `{}`),
  ArrowFunctionExpression: (nodeData) => h('div', `=>`),
  ArrayExpression: (nodeData) =>         h('div', `[]`),
  Literal: (nodeData) =>                 h('div', `${nodeData.node.raw}`),
  FunctionDeclaration: (nodeData) =>     h('div', `λ`),
  BlockStatement: (nodeData) =>          h('div', `{`),
  ReturnStatement: (nodeData) =>         h('div', `<-`),
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

function renderUnknown(nodeData){
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