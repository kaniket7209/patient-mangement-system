const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();
const registerUser = async (req, res) => {
  const { username, password, role } = req.body;
  console.log(req.body);
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
    let collection;
    let newUser;

    if (role === 'patient') {
      // Ensure that only doctors or admins can register a patient
      
      

      // Insert into the 'patients' collection
      collection = req.db.collection('patients');

      // Hash the password for the patient
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new patient object with `createdBy` as the ID of the doctor who registered them
      newUser = {
        username,
        name:username,
        password: hashedPassword, // Store hashed password
        role,
        createdBy: null, // Doctor's user_id who registered the patient
      };
    } else {
      // Insert into the 'users' collection for doctor or admin
      collection = req.db.collection('users');

      // Hash the password for doctor/admin
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the new user object
      newUser = {
        username,
        password: hashedPassword, // Store hashed password for doctor/admin
        role,
      };
    }

    // Check if the user already exists (for both patient and other roles)
    const existingUser = await collection.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Insert the new user into the database
    const result = await collection.insertOne(newUser);
    if (result.acknowledged) {
      return res.status(200).json({ message: role === 'patient' ? 'Patient registered successfully' : 'User registered successfully' });
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
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    let user;
    let collection;

    // Determine which collection to query based on the role
    if (role === 'patient') {
      // Check the 'patients' collection for patient
      collection = req.db.collection('patients');
    } else {
      // Default to the 'users' collection for doctor or admin
      collection = req.db.collection('users');
    }

    // Find the user by username in the selected collection
    user = await collection.findOne({ username });

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
