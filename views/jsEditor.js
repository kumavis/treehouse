const vdom = require('virtual-dom')
const h = require('virtual-hyperscript-hook')(vdom.h)
const mount = require('virtual-hyperscript-mount')()
const CodeMirror = require('codemirror')
require('codemirror/mode/javascript/javascript')
const codemirrorStyle = require('fs').readFileSync(require.resolve('codemirror/lib/codemirror.css'), 'utf8')

module.exports = jsEditor

function jsEditor() {
  var editor
  return (opts) => {
    if (editor) editor.setValue(opts.value)
    return h('div', [
      h('style', codemirrorStyle),
      h('div', {
        // auto focus
        hook: mount((el) => {
          el.value = opts.value
          editor = CodeMirror(el, {
            value: opts.value,
            mode:  'javascript',
            lineNumbers: false,
            tabSize: 2,
          })
          setTimeout(() => editor.refresh())
        }),
      }),
    ])
  }

}
