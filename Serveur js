//importer les modules nécessaires

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');  // Import dotenv
const connectDB = require('./config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

//loader les variables d'environnement
dotenv.config();
//Appeler la fonction de connexion à la base de données
connectDB();
//creer de l'application express
const app = express();

app.use(cors());//middlware pour autoriser les requêtes cross-origin
app.use(express.json()); //middleware pour parser le JSON dans les requêtes

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Middleware to authenticate token and set req.user
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token missing' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Middleware for role-based access
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

const User = require('./config/models/User');
const Course = require('./config/models/Course');

// User registration endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Username, password and role are required' });
  }
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message || error.toString() });
  }
});

// User login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, role: user.role, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Example protected route
app.get('/api/profile', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected profile route', user: req.user });
});

// Get all courses (protected)
app.get('/api/courses', authenticateToken, async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error });
  }
});

const PORT = process.env.PORT || 5000; //port d'écoute de l'application
//démarrer le serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, authenticateToken, authorizeRoles };
