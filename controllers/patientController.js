
const { createPatient, findPatientById, updatePatient, deletePatient ,findPatientsByName, findAllPatients} = require('../models/patient');  // Native MongoDB model or Mongoose model

// Create Patient Handler
const createPatientHandler = async (req, res) => {
  const { name, age, condition, ...otherFields } = req.body;  // Capture optional fields dynamically

  // Validate mandatory fields (name, age)
  if (!name || !age) {
    return res.status(400).json({ message: 'Name and age are required' });
  }

  try {
    // Create a new patient object, including any optional fields
    const newPatient = {
      name,
      age,
      condition: condition || '',  // Default to empty string if not provided
      createdBy: req.user._id,     // Assuming `req.user._id` contains the authenticated user's ID
      ...otherFields              // Include any additional fields dynamically (doctor, address, etc.)
    };
    console.log(newPatient,"newPatient")
    // Call the createPatient function to save the new patient to the database
    const result = await createPatient(newPatient);

    // Respond with success
    return res.status(200).json({ message: 'Patient created successfully', patient: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error creating patient', error: err });
  }
};


// Get Patient by ID Handler
// Get Patient Handler with dynamic querying
const getPatientHandler = async (req, res) => {
  const { id, name } = req.query; // Accept search queries for id and name

  // Check the role of the user to enforce access control
  const userRole = req.user.role;
  const userId = req.user._id;

  try {
    let patients;

    // Admins can search for any patient
    if (userRole === 'admin') {
      if (id) {
        patients = await findPatientById(id);  // If id is provided, search by id
      } else if (name) {
        patients = await findPatientsByName(name);  // If name is provided, search by name
      } else {
        patients = await findAllPatients();  // If no query, return all patients
      }

    } 
    // Doctors can only search for patients assigned to them or search by name/id
    else if (userRole === 'doctor') {
      if (id) {
        patients = await findPatientById(id, userId);  // Doctors can access patients assigned to them
      } else if (name) {
        patients = await findPatientsByName(name, userId);  // Search by name, considering assigned patients
      } else {
        patients = await findPatientsByDoctor(userId);  // Get all patients assigned to this doctor
      }

    }
    // Patients can only access their own records
    else if (userRole === 'patient') {
      if (id === userId) {
        patients = await findPatientById(id);  // Patients can only see their own record by ID
      } else {
        return res.status(403).json({ message: 'Access denied. Patients can only view their own records.' });
      }
    }

    // If no patient found or the request is invalid
    if (!patients || patients.length === 0) {
      return res.status(404).json({ message: 'Patient(s) not found' });
    }

    // Respond with the patient(s) found
    return res.status(200).json(patients);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error retrieving patient(s)', error: err });
  }
};


// Update Patient Handler
const updatePatientHandler = async (req, res) => {
  try {
    const result = await updatePatient(req.params.id, req.body);
    if (!result) return res.status(404).json({ message: 'Patient not found' });

    return res.status(200).json({ message: 'Patient updated successfully', patient: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error updating patient', error: err });
  }
};

// Delete Patient Handler
const deletePatientHandler = async (req, res) => {
  try {
    const result = await deletePatient(req.params.id);
    if (!result) return res.status(404).json({ message: 'Patient not found' });

    return res.status(200).json({ message: 'Patient deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error deleting patient', error: err });
  }
};

module.exports = { createPatientHandler, getPatientHandler, updatePatientHandler, deletePatientHandler };
