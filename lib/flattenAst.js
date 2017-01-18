module.exports = flattenAst

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