const express = require("express");

const state = {
  loading: true,
  initialized: false,
  todos: [],
  areas: [
    { title: "Work", id: "0" },
    { title: "Life", id: "1" }
  ]
};

const dict = {};
const mutate = (id, parser) => {
  dict[id] = parser;
};

mutate("app/init", (term, params, state) => {
  return state;
});

mutate("todo/delete", (term, { todoId }, state) => {
  const newTodos = [...state.todos.filter(({ id }) => id !== todoId)];
  state.todos = newTodos;
  return { todoId };
});

mutate("area/delete", (term, { areaId }, state) => {
  delete state.areas[areaId];
  state.todos = Object.entries(state.todos)
    .filter(([, { area }]) => area === areaId)
    .reduce((res, [todoId, todo]) => ({ ...res, [todoId]: todo }), {});
  return { areaId };
});

mutate("todo/new", (term, { area, text, id }, state) => {
  const todo = state.todos.find(({ id: todoId }) => id === todoId);
  state.todos.push((todo && { ...todo, area, text }) || { id, text, area });
  return { id };
});

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => res.send("Send postage to /api"));
app.post("/api", (req, res) => {
  const [tag, params] = req.body;
  res.send(JSON.stringify((dict[tag] && dict[tag](tag, params, state)) || {}));
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
