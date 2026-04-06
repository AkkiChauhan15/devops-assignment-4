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
      console.error('Failed to parse saved todos:', error)
    }
  }, [])

  const syncTodos = (nextTodos) => {
    setTodos(nextTodos)
    window.localStorage.setItem('todos', JSON.stringify(nextTodos))
  }

  const addTodo = (event) => {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    const nextTodos = [
      ...todos,
      { id: Date.now(), text: trimmed, done: false }
    ]
    syncTodos(nextTodos)
    setText('')
  }

  const toggleTodo = (id) => {
    const nextTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
    syncTodos(nextTodos)
  }

  const removeTodo = (id) => {
    const nextTodos = todos.filter((todo) => todo.id !== id)
    syncTodos(nextTodos)
  }

  const getLastTodoText = () => {
    return todos.length > 0 ? todos[todos.length - 1].text : 'None'
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
          todos.map((todo) => (
            <li key={todo.id} className={todo.done ? 'todo done' : 'todo'}>
              <button
                type="button"
                className="todo-toggle"
                onClick={() => toggleTodo(todo.id)}
                aria-label={`Mark ${todo.text} as ${todo.done ? 'incomplete' : 'complete'}`}
              >
                {todo.done ? '✓' : '○'}
              </button>
              <span>{todo.text}</span>
              <button
                type="button"
                className="todo-remove"
                onClick={() => removeTodo(todo.id)}
                aria-label={`Remove ${todo.text}`}
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