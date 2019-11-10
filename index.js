const express = require('express')

let state = {
    loading: true,
    initialized: false,
    todos: {},
    areas: {
        0: {title: 'Sasat'},
        1: {title: 'Lizat'},
    },
}

const dict = {};
const mutate = (id, parser) => {
    dict[id] = parser;
};

mutate('app/init', (term, params,  state) => {
    return state
})

mutate('todo/delete', (term, { areaId, todoId }, state) => {
    const newTodos = { ...state.todos }
    delete newTodos[todoId]
    state.todos = newTodos
    return {todoId}
})

mutate('area/delete', (term, { areaId }, state) => {
    delete state.areas[areaId]
    state.todos = Object.entries(state.todos)
        .filter(([, { area }]) => area === areaId)
        .reduce((res, [todoId, todo]) => ({ ...res, [todoId]: todo }), {})
    return {areaId}
})

mutate('todo/new', (term, { area, text, id }, state) => {
    state.todos  = {...state.todos, [id]: { text, area }}
    return {id}
})

const app = express()
const port = 3000

app.use(express.json());

app.get('/', (req, res) => res.send('Send postage to /api'))
app.post('/api', (req, res) => {
    const [tag, params] = req.body
    res.send(JSON.stringify(dict[tag] && dict[tag](tag, params, state) || {}))
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

