// This file initializes the server and middleware, sets up routes, and connects to the MongoDB database.
require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');


const app = express();
app.use(express.json());  // Middleware to parse JSON request bodies

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URI);

client.connect()
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.error('Failed to connect to the database:', err));

// Pass the connected client to the routes
app.use('/api/auth', require('./routes/authRoutes')(client));
app.use('/api/patients', patientRoutes);

// Set the server to listen on a specific port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
