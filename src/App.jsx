import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Get all tasks
  async function fetchTasks() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTasks(data);
    }

    setLoading(false);
  }

  // Add a task
  async function addTask(e) {
    e.preventDefault();

    if (!title.trim()) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: title.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setTasks((currentTasks) => [data, ...currentTasks]);
    setTitle("");
    setError("");
  }

  // Complete / uncomplete task
  async function toggleTask(task) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        completed: !task.completed,
      })
      .eq("id", task.id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === task.id ? data : item
      )
    );
  }

  // Delete task
  async function deleteTask(id) {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== id)
    );
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <main className="app">
      <div className="container">

        <header className="header">
          <p className="eyebrow">PRODUCTIVITY</p>
          <h1>Task Manager</h1>
          <p className="subtitle">
            Keep track of what needs to get done.
          </p>
        </header>

        <form className="task-form" onSubmit={addTask}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <button type="submit">
            Add Task
          </button>
        </form>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <section className="tasks-section">

          <div className="section-header">
            <h2>Tasks</h2>

            <span>
              {tasks.length}{" "}
              {tasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          {loading ? (
            <p className="empty-state">
              Loading tasks...
            </p>
          ) : tasks.length === 0 ? (
            <p className="empty-state">
              No tasks yet. Add your first task above.
            </p>
          ) : (
            <div className="task-list">

              {tasks.map((task) => (
                <div
                  className={`task ${
                    task.completed ? "completed" : ""
                  }`}
                  key={task.id}
                >

                  <label className="task-left">

                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task)}
                    />

                    <span>{task.title}</span>

                  </label>

                  <button
                    className="delete-button"
                    onClick={() => deleteTask(task.id)}
                  >
                    Delete
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

export default App;