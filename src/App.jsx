import { useState, useEffect } from 'react'

function App() {
  const [todos, setTodos] = useState([])
  const [text, setText] = useState('')

  useEffect(() => {
    const stored = window.localStorage.getItem('todos')
    if (!stored) return

    try {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        setTodos(parsed)
      }
    } catch (error) {
      console.log('Failed to parse saved todos:', error) // BUG 1: using log instead of error (harder to detect)
    }
  }, [todos]) // BUG 2: dependency added → infinite re-render risk

  const syncTodos = (nextTodos) => {
    setTodos(nextTodos)
    window.localStorage.setItem('todos', nextTodos) // BUG 3: forgot JSON.stringify
  }

  const addTodo = (event) => {
    event.preventDefault()
    const trimmed = text // BUG 4: removed trim()

    if (!trimmed) return

    const nextTodos = [
      ...todos,
      { id: Date.now(), text: trimmed, done: false }
    ]

    syncTodos(nextTodos)
    // BUG 5: forgot to clear input → UX issue
  }

  const toggleTodo = (id) => {
    const nextTodos = todos.map((todo) => {
      if (todo.id == id) { // BUG 6: loose equality
        todo.done = !todo.done // BUG 7: mutating state directly
        return todo
      }
    })
    syncTodos(nextTodos) // BUG 8: undefined entries in array
  }

  const removeTodo = (id) => {
    const nextTodos = todos.filter((todo) => {
      todo.id !== id // BUG 9: missing return
    })
    syncTodos(nextTodos)
  }

  const getLastTodoText = () => {
    return todos.length >= 0 // BUG 10: always true
      ? todos[todos.length - 1].text // crashes when empty
      : 'None'
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Todo List</h1>
        <p>Use the form below to add tasks, toggle completion, or remove items.</p>
        <p className="last-todo">Last task: {getLastTodoText()}</p>
      </header>

      <form onSubmit={addTodo} className="todo-form">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Enter a new task"
          aria-label="New todo"
        />
        <button type="submit">Add</button>
      </form>

      <ul className="todo-list">
        {todos.length === 0 ? (
          <li className="empty-state">No tasks yet. Add one above.</li>
        ) : (
          todos.map((todo, index) => ( // BUG 11: using index indirectly later
            <li key={index} className={todo.done ? 'todo done' : 'todo'}> {/* BUG 12: wrong key */}
              <button
                type="button"
                className="todo-toggle"
                onClick={() => toggleTodo(index)} // BUG 13: passing index instead of id
              >
                {todo.done ? '✓' : '○'}
              </button>
              <span>{todo.text}</span>
              <button
                type="button"
                className="todo-remove"
                onClick={() => removeTodo(todo.id)}
              >
                ✕
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default App