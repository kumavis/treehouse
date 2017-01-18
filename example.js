const app = choo()

app.model({
  state: {
    title: 'Set the title',
    ast: ast,
  },
  reducers: {
    update: (action, state) => ({ title: action.value })
  }
})

app.router(['/', mainView])

function mainView (state, prev, send) {
  return createElement(
    renderRoot(state, prev, send)
  )
}

const tree = app.start()
document.body.appendChild(tree)