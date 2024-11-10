const express = require('express');
const { ObjectId } = require('mongodb');
const { authenticate, checkRole } = require('../middleware/authMiddleware');

const appointmentRoutes = (client) => {
  const router = express.Router();
  const db = client.db('patientManagement');
  const appointmentsCollection = db.collection('appointments');

  // Create Appointment (Patients and Admins)
  router.post('/', authenticate, checkRole(['patient', 'admin']), async (req, res) => {
    try {
      const { doctorId, date, patientId } = req.body;
      const creatorId = req.user._id;
      const currentTimestamp = new Date();
  
      // Set patient ID based on role (patients can only book for themselves)
      const assignedPatientId = req.user.role === 'patient' ? creatorId : patientId;
  
      // Create the appointment date object
      const appointmentDate = new Date(date);
  
      // Check for existing appointment with same doctor, patient, and date
      const existingAppointment = await appointmentsCollection.findOne({
        doctorId: doctorId,
        patientId: assignedPatientId,
        date: appointmentDate,
      });
  
      if (existingAppointment) {
        // Update the existing appointment status and modified_at if it exists
        const result = await appointmentsCollection.updateOne(
          { _id: existingAppointment._id },
          { $set: { status: 'pending', modified_at: currentTimestamp } }
        );
        return res.status(200).json({ message: 'Appointment updated successfully', data: result });
      }
  
      // Create a new appointment if no existing record is found
      const newAppointment = {
        doctorId: doctorId,
        patientId: assignedPatientId,
        date: appointmentDate,
        status: 'pending',
        created_at: currentTimestamp,
        modified_at: currentTimestamp,
      };
  
      const result = await appointmentsCollection.insertOne(newAppointment);
      res.status(201).json({ message: 'Appointment created successfully', data: result });
    } catch (error) {
      res.status(500).json({ message: 'Failed to create appointment', error });
    }
  });
  
  

  // Get Appointments (Role-based Access)
  router.get('/:appointmentId?', authenticate, checkRole(['admin', 'doctor', 'patient']), async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const role = req.user.role;
      const userId = req.user._id;
      let appointments;
  
      if (appointmentId) {
        // If an appointmentId is provided, return that specific appointment
        const appointment = await appointmentsCollection.findOne({ 
          _id: new ObjectId(appointmentId), 
          // Restrict access based on user role
          ...(role === 'doctor' && { doctorId: userId }),
          ...(role === 'patient' && { patientId: userId })
        });
  
        if (!appointment) {
          return res.status(404).json({ message: 'Appointment not found or access denied' });
        }
  
        return res.status(200).json(appointment);
      } else {
        // If no appointmentId, return appointments based on the role
        if (role === 'admin') {
          appointments = await appointmentsCollection.find().toArray();
        } else if (role === 'doctor') {
          appointments = await appointmentsCollection.find({ doctorId: userId }).toArray();
        } else if (role === 'patient') {
          appointments = await appointmentsCollection.find({ patientId: userId }).toArray();
        }
  
        res.status(200).json(appointments);
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to get appointments', error });
    }
  });
  

  // Update Appointment (Doctors for assigned, Patients for own, Admin for all)
  router.put('/:appointmentId', authenticate, checkRole(['doctor', 'patient', 'admin']), async (req, res) => {
    try {
      const { appointmentId } = req.params; // Appointment ID from URL
      const { date, status } = req.body;
      const userId = (req.user._id); // Cast user ID from token to ObjectId
      const userRole = req.user.role;
  
      // Log user role and ID for debugging
      console.log("User Role:", userRole);
      console.log("User ID (from token):", userId);
  
      // Build filter to match appointment ID and restrict doctor access to their own appointments
      let filter = { _id: new ObjectId(appointmentId) };
  
      if (userRole === 'doctor') {
        filter.doctorId = userId; // Ensure doctor can only access their own appointments
        console.log("Doctor filter:", filter); // Log filter when user is doctor
      } else if (userRole === 'patient') {
        filter.patientId = userId; // Patients can only update their own appointments
        console.log("Patient filter:", filter); // Log filter when user is patient
      } else if (userRole === 'admin') {
        console.log("Admin filter:", filter); // Log filter when user is admin (no restriction)
      }
  
      // Log the filter before querying
      console.log("Final Filter for Appointment:", filter);
  
      // Update fields with modified_at timestamp
      const updateData = {
        ...(date && { date: new Date(date) }),
        ...(status && { status }),
        modified_at: new Date() // Set the modified_at timestamp
      };
  
      // Log update data
      console.log("Update Data:", updateData);
  
      const result = await appointmentsCollection.updateOne(filter, { $set: updateData });
  
      if (result.matchedCount === 0) {
        return res.status(404).json({ message: 'Appointment not found or access denied' });
      }
  
      res.status(200).json({ message: 'Appointment updated successfully', data: result });
    } catch (error) {
      console.error("Error during appointment update:", error);
      res.status(500).json({ message: 'Failed to update appointment', error });
    }
  });
  

  // Delete Appointment (Admin only)
  router.delete('/:appointmentId', authenticate, checkRole(['admin','patient']), async (req, res) => {
    try {
      const { appointmentId } = req.params;

      const result = await appointmentsCollection.deleteOne({ _id: new ObjectId(appointmentId) });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete appointment', error });
    }
  });

  return router;
};

module.exports = appointmentRoutes;
