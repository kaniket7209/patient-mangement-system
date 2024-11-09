const { MongoClient } = require('mongodb');
const uri = process.env.MONGO_URI; // Your MongoDB connection string

// Create a new patient record
const createPatient = async (patient) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collection = db.collection('patients');

  const result = await collection.insertOne(patient);
  await client.close();
  return result;
};

// Find a patient by ID
const findPatientById = async (id) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collection = db.collection('patients');

  const patient = await collection.findOne({ _id: new ObjectId(id) });
  await client.close();
  return patient;
};

// Update a patient record
const updatePatient = async (id, updateData) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collection = db.collection('patients');

  const result = await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });
  await client.close();
  return result;
};

// Delete a patient record
const deletePatient = async (id) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collection = db.collection('patients');

  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  await client.close();
  return result;
};

module.exports = { createPatient, findPatientById, updatePatient, deletePatient };
