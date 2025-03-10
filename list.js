function App() {
    const [tasks, setTasks] = React.useState(() => {
      const storedTasks = localStorage.getItem("tasks");
      return storedTasks ? JSON.parse(storedTasks) : [];
    });
    const [newTask, setNewTask] = React.useState("");
    const [newDeadline, setNewDeadline] = React.useState("");
    const [filter, setFilter] = React.useState("all");
    const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem("theme") === "dark");
  
    // Save tasks to localStorage whenever they change
    React.useEffect(() => {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);
  
    // Save theme preference and toggle body dark mode
    React.useEffect(() => {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
      if (darkMode) {
        document.body.classList.add("dark-mode");
      } else {
        document.body.classList.remove("dark-mode");
      }
    }, [darkMode]);
  
    const addTask = () => {
      if (!newTask || !newDeadline) {
        alert("Please enter both task name and deadline.");
        return;
      }
      const task = {
        id: Date.now(),
        name: newTask,
        deadline: newDeadline,
        completed: false,
        editing: false,
      };
      setTasks([...tasks, task]);
      setNewTask("");
      setNewDeadline("");
    };
  
    const toggleTask = (id) => {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ));
    };
  
    const deleteTask = (id) => {
      setTasks(tasks.filter(task => task.id !== id));
    };
  
    const startEditing = (id) => {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, editing: true } : task
      ));
    };
  
    const saveEdit = (id, editedName, editedDeadline) => {
      if (!editedName || !editedDeadline) {
        alert("Both fields are required.");
        return;
      }
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, name: editedName, deadline: editedDeadline, editing: false } : task
      ));
    };
  
    const cancelEdit = (id) => {
      setTasks(tasks.map(task => 
        task.id === id ? { ...task, editing: false } : task
      ));
    };
  
    // Filter tasks based on the current filter state
    const filteredTasks = tasks.filter(task => {
      if (filter === "all") return true;
      if (filter === "completed") return task.completed;
      if (filter === "pending") return !task.completed;
      return true;
    });
  
    return (
      <div className="container">
        <h1>To-Do List</h1>
        <button onClick={() => setDarkMode(prev => !prev)}>
          {darkMode ? "🔆 Light Mode" : "🌙 Dark Mode"}
        </button>
        
        {/* New Task Input Section */}
        <div className="input-section">
          <input 
            type="text" 
            placeholder="Task Name" 
            value={newTask} 
            onChange={(e) => setNewTask(e.target.value)} 
          />
          <input 
            type="datetime-local" 
            value={newDeadline} 
            onChange={(e) => setNewDeadline(e.target.value)} 
          />
          <button onClick={addTask}>Add Task</button>
        </div>
  
        {/* Filter Buttons */}
        <div className="filters">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("completed")}>Completed</button>
          <button onClick={() => setFilter("pending")}>Pending</button>
        </div>
  
        {/* Task List */}
        <ul>
          {filteredTasks.map(task => (
            <li key={task.id}>
              {task.editing ? (
                <TaskEditForm task={task} saveEdit={saveEdit} cancelEdit={cancelEdit} />
              ) : (
                <div className="task-display">
                  <input 
                    type="checkbox" 
                    checked={task.completed} 
                    onChange={() => toggleTask(task.id)} 
                  />
                  <span className={`task-info ${task.completed ? "completed" : ""}`}>
                    {task.name} - Deadline: {new Date(task.deadline).toLocaleString()}
                  </span>
                  <button onClick={() => startEditing(task.id)}>Edit</button>
                  <button onClick={() => deleteTask(task.id)}>❌</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  function TaskEditForm({ task, saveEdit, cancelEdit }) {
    const [editedName, setEditedName] = React.useState(task.name);
    const [editedDeadline, setEditedDeadline] = React.useState(task.deadline);
  
    return (
      <div className="edit-form">
        <input 
          type="text" 
          value={editedName} 
          onChange={(e) => setEditedName(e.target.value)} 
        />
        <input 
          type="datetime-local" 
          value={editedDeadline} 
          onChange={(e) => setEditedDeadline(e.target.value)} 
        />
        <button onClick={() => saveEdit(task.id, editedName, editedDeadline)}>Save</button>
        <button onClick={() => cancelEdit(task.id)}>Cancel</button>
      </div>
    );
  }
  
  ReactDOM.createRoot(document.getElementById("root")).render(<App />);
  