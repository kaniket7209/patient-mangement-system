const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const uri = process.env.MONGO_URI; // Your MongoDB connection string

// Hash password before saving
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Create a new user
const createUser = async (user) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collection = db.collection('users');
  const hashedPassword = await hashPassword(user.password);
  const newUser = { ...user, password: hashedPassword };

  const result = await collection.insertOne(newUser);
  await client.close();
  return result;
};

// Find a user by username
const findUserByUsername = async (username) => {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const collection = db.collection('users');

  const user = await collection.findOne({ username });
  await client.close();
  return user;
};

module.exports = { createUser, findUserByUsername };
