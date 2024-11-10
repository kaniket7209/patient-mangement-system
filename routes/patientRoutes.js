const express = require('express');
const { createPatientHandler, getPatientHandler, updatePatientHandler, deletePatientHandler } = require('../controllers/patientController');
const { authenticate, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes with the authenticate middleware
router.post('/add', authenticate, checkRole(['admin', 'doctor']), createPatientHandler);  // Add a new patient
router.get('/', authenticate, checkRole(['admin', 'doctor']), getPatientHandler);
router.put('/:id', authenticate, updatePatientHandler);  // Update a patient
router.delete('/:id', authenticate, deletePatientHandler);  // Delete a patient

module.exports = router;
