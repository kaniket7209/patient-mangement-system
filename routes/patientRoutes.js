const express = require('express');
// const { createPatientHandler, getPatientHandler, updatePatientHandler, deletePatientHandler } = require('../controllers/patientController');
const { ObjectId } = require('mongodb');
const { authenticate, checkRole } = require('../middleware/authMiddleware');

const patientRoutes = (client) => {
  const router = express.Router();
  const db = client.db('patientManagement');
  const patientsCollection = db.collection('patients');

  // Handler to create a new patient record
  const createPatientHandler = async (req, res) => {
    try {
      const patientData = req.body;
      const result = await patientsCollection.insertOne(patientData);
      res.status(201).json({ message: 'Patient added successfully', data: result });
    } catch (error) {
      res.status(500).json({ message: 'Failed to add patient', error });
    }
  };

  // Handler to get patient records with flexible search options
  const getPatientHandler = async (req, res) => {
    const { role, _id: userId } = req.user; // Extracting role and ID from JWT token payload
    const { id, name } = req.query; // Assuming we can filter by `id` or `name` via query parameters
  
    const query = {};
    
    if (role === 'doctor') {
      // Only fetch records assigned to this doctor
      query.createdBy = userId;
    } else if (role === 'patient') {
      // Fetch only the record of the authenticated patient
      query._id = new ObjectId(userId);
    }
  
    // Apply filtering based on optional search criteria (id or name)
    if (id) {
      query._id = new ObjectId(id);
    } else if (name) {
      query.name = { $regex: name, $options: 'i' }; // Case-insensitive search by name
    }
  
    try {
      const patients = await patientsCollection.find(query).toArray();
      res.status(200).json(patients);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error });
    }
  };
  

  // Handler to update an existing patient record by ID
  const updatePatientHandler = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const result = await patientsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      res.status(200).json({ message: 'Patient updated successfully', data: result });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update patient', error });
    }
  };

  // Handler to delete a patient record by ID
  const deletePatientHandler = async (req, res) => {
    try {
      const { id } = req.params;

      const result = await patientsCollection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Patient not found' });
      }

      res.status(200).json({ message: 'Patient deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete patient', error });
    }
  };

  // Routes with the authenticate middleware and role checks
  router.post('/add', authenticate, checkRole(['admin', 'doctor']), createPatientHandler); // Add a new patient
  router.get('/', authenticate, checkRole(['admin', 'doctor']), getPatientHandler);         // Get patients by ID or name
  router.put('/:id', authenticate, checkRole(['admin', 'doctor']), updatePatientHandler);    // Update a patient
  router.delete('/:id', authenticate, checkRole(['admin']), deletePatientHandler);           // Delete a patient

  return router;
};

module.exports = patientRoutes;

