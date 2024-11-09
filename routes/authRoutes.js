const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');

// Pass MongoDB client to controller
module.exports = (client) => {
  // Middleware to attach the database to the request object
  router.use((req, res, next) => {
    req.db = client.db('patientManagement');  // Attach the database to req.db
    next();
  });

  // Register route
  router.post('/register', registerUser);

  // Login route
  router.post('/login', loginUser);

  return router;
};
