const express = require('express');
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
        try {
            const userId = req.user._id; // Get the user ID from the decoded JWT (set by authenticate)
            const role = req.user.role; // Get the user role

            const { patientId, name } = req.query; // Search query for patientId or name

            let query = {};

            // If the query has a patientId, search by that
            if (patientId) {
                query = { _id: new ObjectId(patientId) };
            }

            // If the query has a name, search by that
            else if (name) {
                query = { name: new RegExp(name, 'i') }; // Case-insensitive search by name
            } else if (role === 'admin') {
                // Admin can view all patients
                query = {};
            } else if (role === 'doctor') {
                // Doctor can only view assigned patients
                query = { createdBy: userId };
            } else if (role === 'patient') {
                // Patient can only view their own record
                query = { _id: new ObjectId(userId) };
            } else {
                return res.status(403).json({ message: 'Access denied' });
            }

            const patients = await patientsCollection.find(query).toArray();

            if (patients.length === 0) {
                return res.status(404).json({ message: 'No patients found' });
            }

            return res.status(200).json(patients);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error', error: err });
        }
    };

    // Handler to update an existing patient record by ID
    const updatePatientHandler = async (req, res) => {
        try {
            const { id } = req.params;

            const updateData = req.body;

            // Ensure the ID is valid
            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ message: 'Invalid patient ID' });
            }


            // Perform the update
            const result = await patientsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            // Log the result of the update operation


            if (result.matchedCount === 0) {
                return res.status(404).json({ message: 'Patient not found' });
            }

            // Return success response
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
    router.get('/', authenticate, checkRole(['admin', 'doctor', 'patient']), getPatientHandler); // Get patients by ID or name
    router.put('/:id', authenticate, checkRole(['admin', 'doctor']), updatePatientHandler);  // Update a patient
    router.delete('/:id', authenticate, checkRole(['admin']), deletePatientHandler); // Delete a patient

    return router;
};

module.exports = patientRoutes;
