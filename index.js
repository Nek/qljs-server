const express = require('express')

const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

const state = {
    loading: true,
    initialized: false,
    todos: [],
    areas: [
        { title: 'Work', id: '0' },
        { title: 'Life', id: '1' },
    ],
}

db.defaults(state).write()

const dict = {}
const mutate = (id, parser) => {
    dict[id] = parser
}

mutate('app/init', (term, params, state) => {
    return state
})

mutate('todo/delete', (term, { todoId }, state) => {
    const newTodos = [...state.todos.filter(({ id }) => id !== todoId)]
    state.todos = newTodos
    return { todoId }
})

mutate('todo/new', (term, { area, text, id }, state) => {
    const todo = state.todos.find(({ id: todoId }) => id === todoId)
    state.todos.push((todo && { ...todo, area, text }) || { id, text, area })
    return { id }
})

const app = express()
const port = 3000

app.use(express.json())

app.get('/', (req, res) => res.send('Send postage to /api'))
app.post('/api', (req, res) => {
    const [tag, params] = req.body
    res.send(JSON.stringify((dict[tag] && dict[tag](tag, params, state)) || {}))
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
