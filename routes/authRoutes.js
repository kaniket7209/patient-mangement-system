const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');

const authRoutes = (client) => {
  const router = express.Router();

  // Middleware to attach the database to the request object
  router.use((req, res, next) => {
    req.db = client.db('patientManagement');  // Attach the database to req.db
    next();
  });

  // Register route
  router.post('/register', (req, res) => registerUser(req, res));

  // Login route
  router.post('/login', (req, res) => loginUser(req, res));

  return router;
};

module.exports = authRoutes;
