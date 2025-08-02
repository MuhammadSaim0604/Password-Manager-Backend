require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Models
const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

});

const User = mongoose.model('User', UserSchema);

const PasswordSchema = new mongoose.Schema({
  url: String,
  username: String,
  password: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
const Password = mongoose.model('Password', PasswordSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Auth Middleware
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("email _id name");;
    if (!req.user) throw new Error();
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Add to your server.js
app.get('/api/auth/verify', authenticate, (req, res) => {
  res.json({ user: req.user });
});


// Routes
router.post('/api/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({ email, password: hashedPassword });
    await user.save();

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      user: { id: user._id, email: user.email },
      token
    });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, email: user.email },
      token
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// Protected Routes
app.get('/api/passwords', authenticate, async (req, res) => {
  try {
    const passwords = await Password.find({ userId: req.user._id });
    res.json(passwords);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/passwords', authenticate, async (req, res) => {
  try {
    const newPassword = new Password({ ...req.body, userId: req.user._id });
    const savedPassword = await newPassword.save();
    res.status(201).json(savedPassword);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/api/passwords/:id', authenticate, async (req, res) => {
  try {
    const password = await Password.findOne({ _id: req.params.id, userId: req.user._id });
    if (!password) return res.status(404).json({ message: 'Password not found' });

    const updatedPassword = await Password.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedPassword);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/passwords/:id', authenticate, async (req, res) => {
  try {
    const password = await Password.findOne({ _id: req.params.id, userId: req.user._id });
    if (!password) return res.status(404).json({ message: 'Password not found' });

    await Password.findByIdAndDelete(req.params.id);
    res.json({ message: 'Password deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/api/delete-account', authenticate, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    await Password.deleteMany({ userId: req.user._id });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
}
)

app.patch('/api/profile', authenticate, async (req, res) => {
  const { name } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true, runValidators: true }
    ).select('email name');

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

app.get('/api/export-data', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('email name');
    const passwords = await Password.find({ userId: req.user._id });
    const data = {
      user: {
        email: user.email,
        name: user.name
      },
      passwords: passwords.map(p => ({
        url: p.url,
        username: p.username,
        password: p.password
      }))
    };
    const json = JSON.stringify(data, null, 2);
    res.setHeader('Content-Disposition', 'attachment; filename=data.json');
    res.setHeader('Content-Type', 'application/json');
    res.send(json);
    } catch (err) {
    console.error('Data export error:', err);
    res.status(500).json({ message: 'Failed to export data' });
  }
});


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});