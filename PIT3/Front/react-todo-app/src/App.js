import React, { useState, useEffect } from 'react';
import axios from './axios'; 
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');


  useEffect(() => {
    const theme = darkMode ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // Fetch tasks from the Django API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('tasks/');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!newTask || !newDeadline) {
      alert('Please enter both task name and deadline.');
      return;
    }
    const task = { name: newTask, deadline: newDeadline, completed: false };
    try {
      const response = await axios.post('tasks/', task);
      setTasks([...tasks, response.data]);
      setNewTask('');
      setNewDeadline('');
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (id) => {
    const taskToUpdate = tasks.find((task) => task.id === id);
    if (!taskToUpdate) return;
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };
    try {
      await axios.put(`tasks/${id}/`, updatedTask);
      setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`tasks/${id}/`);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const startEditing = (id) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, editing: true } : task)));
  };

  const saveEdit = async (id, editedName, editedDeadline) => {
    if (!editedName || !editedDeadline) {
      alert('Both fields are required.');
      return;
    }
    const updatedTask = { name: editedName, deadline: editedDeadline, completed: false };
    try {
      await axios.put(`tasks/${id}/`, updatedTask);
      setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updatedTask, editing: false } : task)));
    } catch (error) {
      console.error('Error saving edited task:', error);
    }
  };

  const cancelEdit = (id) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, editing: false } : task)));
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  return (
    <div className="container">
      <h1>To-Do List</h1>
      <button onClick={() => setDarkMode((prev) => !prev)}>
        {darkMode ? '🔆 Light Mode' : '🌙 Dark Mode'}
      </button>

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

      <div className="filters">
        <button onClick={() => setFilter('all')}>All</button>
        <button onClick={() => setFilter('completed')}>Completed</button>
        <button onClick={() => setFilter('pending')}>Pending</button>
      </div>

      <ul>
        {filteredTasks.map((task) => (
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
                <span className={`task-info ${task.completed ? 'completed' : ''}`}>
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
  const [editedName, setEditedName] = useState(task.name);
  const [editedDeadline, setEditedDeadline] = useState(task.deadline);

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

export default App;
