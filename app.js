const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const secretKey = 'yourSecretKey'; // Replace with a secure secret key in production

app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// In-memory database (replace this with a real database in a production environment)
let users = [];
let tasks = [];

// Middleware for authentication
const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// User Management

// Register a new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const newUser = { username, password };
  users.push(newUser);
  res.json({ message: 'User registered successfully', user: newUser });
});

// Login and get a JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: user.username }, secretKey);
  res.json({ token });
});

// Task Management
app.get('/', (req, res) => {
    res.render('index');
  });
  
  app.get('/dashboard', (req, res) => {
    res.render('dashboard', { username: req.user.username, tasks });
  });
  
  app.listen(port, () => {
    console.log(`Task management system listening at http://localhost:${port}`);
  });
// Get all tasks (authentication required)
app.get('/tasks', authenticateToken, (req, res) => {
  res.json(tasks);
});
// Search and Filtering routes

// Search for tasks based on title, description, or assigned user
app.get('/tasks/search', (req, res) => {
    const { query } = req.query;
  
    const filteredTasks = tasks.filter(
      (task) =>
        task.title.includes(query) ||
        task.description.includes(query) ||
        (task.assignee && task.assignee.includes(query))
    );
  
    res.json(filteredTasks);
  });
  // Filter tasks based on completion status and due date
app.get('/tasks/filter', (req, res) => {
    const { completed, dueDate } = req.query;
  
    let filteredTasks = tasks;
  
    if (completed !== undefined) {
      filteredTasks = filteredTasks.filter((task) => task.completed === (completed === 'true'));
    }
  
    if (dueDate) {
      filteredTasks = filteredTasks.filter((task) => task.dueDate === dueDate);
    }
  
    res.json(filteredTasks);
  });
  
  // ...
  

// Create a new task (authentication required)
app.post('/tasks', authenticateToken, (req, res) => {
  const newTask = { ...req.body, assignedUser: req.user.username };
  tasks.push(newTask);
  res.json(newTask);
});

// Update a task (authentication required)
app.put('/tasks/:taskId', authenticateToken, (req, res) => {
  const taskId = req.params.taskId;
  const updatedTask = req.body;
  tasks = tasks.map((task) => (task.id === taskId ? updatedTask : task));
  res.json(updatedTask);
});

// Delete a task (authentication required)
app.delete('/tasks/:taskId', authenticateToken, (req, res) => {
  const taskId = req.params.taskId;
  tasks = tasks.filter((task) => task.id !== taskId);
  res.send('Task deleted successfully');
});

app.listen(port, () => {
  console.log(`Task management system listening at http://localhost:${port}`);
});
