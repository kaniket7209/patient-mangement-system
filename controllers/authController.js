const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MongoDB connection
const client = new MongoClient(process.env.MONGO_URI);
client.connect()
  .then(() => console.log('MongoDB Connected Successfully!'))
  .catch((err) => console.error('Failed to connect to the database:', err));

const db = client.db('patientManagement');
const usersCollection = db.collection('users');

// Register User Function
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;

  // Validate required fields
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate role
  const validRoles = ['admin', 'doctor', 'patient'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ message: 'Invalid role provided' });
  }

  try {
    // Check if the user already exists
    const existingUser = await usersCollection.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user object
    const newUser = {
      username,
      password: hashedPassword, // Store hashed password
      role,
    };

    // Insert the new user into the database
    const result = await usersCollection.insertOne(newUser);

    if (result.acknowledged) {
      return res.status(200).json({ message: 'User registered successfully' });
    } else {
      return res.status(500).json({ message: 'Error registering user' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};

// Login User Function
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Find the user by username
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with _id, username, and role
    const token = jwt.sign(
      { user: { _id: user._id, username: user.username, role: user.role } }, // Include _id
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send the token to the client
    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err });
  }
};


module.exports = { registerUser, loginUser };
