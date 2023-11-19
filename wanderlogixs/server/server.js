const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

// Route imports
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const tripsRoutes = require('./routes/trips');
const expensesRoutes = require('./routes/expenses');
const sharedMemoriesRoutes = require('./routes/sharedMemories');
const dashboardRoutes = require('./routes/dashboard');

// Define the routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/trips', tripsRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/sharedMemories', sharedMemoriesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Optional: Default route to test server
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

const port = process.env.PORT || 5000; // Use consistent variable naming for the port

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
