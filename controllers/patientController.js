
const { createPatient, findPatientById, updatePatient, deletePatient } = require('../models/patient');  // Native MongoDB model or Mongoose model

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
const getPatientHandler = async (req, res) => {
  try {
    const patient = await findPatientById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    return res.status(200).json(patient);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Error retrieving patient', error: err });
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
