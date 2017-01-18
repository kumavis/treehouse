const h = require('virtual-dom/virtual-hyperscript')
const renderAst = require('./ast')

module.exports = function(state, dispatch) {
  return (

    h('div', [
      h('style', getStyle()),
      
      h('div', `cursor: ${state.cursorIndex}`),
      h('div', renderAst(state, dispatch)),
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

  input:focus {
    outline: none;
    padding: 0;
    border: none;
  }
  `
}

