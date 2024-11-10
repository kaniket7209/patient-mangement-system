const { MongoClient, ObjectId } = require('mongodb');

// Use a global client connection to MongoDB
const uri = process.env.MONGO_URI; // Your MongoDB connection string
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

let patientsCollection;

client.connect()
  .then(() => {
    console.log('MongoDB Connected Successfully!');
    const db = client.db('patientManagement');
    patientsCollection = db.collection('patients');  // Initialize the patients collection
  })
  .catch((err) => console.error('Failed to connect to the database:', err));

// Create a new patient record
const createPatient = async (patient) => {
  const result = await patientsCollection.insertOne(patient);
  return result;
};

// Find a patient by ID
const findPatientById = async (id, doctorId = null) => {
  const query = doctorId ? { _id: new ObjectId(id), doctor: doctorId } : { _id: new ObjectId(id) };
  return await patientsCollection.findOne(query);
};

// Find patients by name
const findPatientsByName = async (name, doctorId = null) => {
  const query = doctorId ? { name: { $regex: name, $options: 'i' }, doctor: doctorId } : { name: { $regex: name, $options: 'i' } };
  return await patientsCollection.find(query).toArray();
};

// Find all patients for a specific doctor
const findPatientsByDoctor = async (doctorId) => {
  return await patientsCollection.find({ doctor: doctorId }).toArray();
};

// Find all patients (Admin access)
const findAllPatients = async () => {
  return await patientsCollection.find().toArray();
};

// Update a patient record
const updatePatient = async (id, updateData) => {
  const result = await patientsCollection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  return result;
};

// Delete a patient record
const deletePatient = async (id) => {
  const result = await patientsCollection.deleteOne({ _id: new ObjectId(id) });
  return result;
};

module.exports = {
  createPatient,
  findPatientById,
  updatePatient,
  deletePatient,
  findPatientsByDoctor,
  findPatientsByName,
  findAllPatients,
};
