const { MongoClient } = require('mongodb');

// MongoDB URI and DB name
const uri = process.env.MONGO_URI || 'mongodb+srv://aniket:12345@cluster0.8sfpess.mongodb.net';
const dbName = process.env.DB_NAME || 'patientManagement';

let db = null;
let client = null;

// Connect to the database
const connectDB = async () => {
  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    console.log('MongoDB Connected Successfully!');
  } catch (err) {
    console.error('Failed to connect to the database:', err);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not connected');
  }
  return db;
};

const closeDB = () => {
  if (client) {
    client.close();
  }
};

module.exports = { connectDB, getDB, closeDB };
