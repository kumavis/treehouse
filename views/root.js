const h = require('virtual-dom/virtual-hyperscript')
const libStyles = require('fs').readFileSync(require.resolve('../assets/lib.css'), 'utf8')
const appStyles = require('fs').readFileSync(require.resolve('../assets/index.css'), 'utf8')
const renderAst = require('./ast')
const jsEditor = require('./jsEditor')

module.exports = function(state, dispatch) {
  return (

    h('div', [
      h('style', libStyles),
      h('style', appStyles),
      
      h('div', `cursor: ${state.cursorIndex}`),
      
      h('.flex-row', [
        h('.flex-grow.flex-ignore-width', renderAst(state, dispatch)),
        h('.flex-grow.flex-ignore-width', jsEditor({ value: state.src })),
      ]),
      
    ])

  )
}
