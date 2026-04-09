import jwt from 'jsonwebtoken';
import User from '../models/User.js';


// =======================
// 🔐 REGISTER
// =======================
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    // Create user (password auto-hashed via model)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'nurse', // default role
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    next(error);
  }
};


// =======================
// 🔐 LOGIN
// =======================
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    // Find user + include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: 'Invalid credentials',
      });
    }

    // Create JWT payload
    const payload = {
      id: user._id,
      role: user.role,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    next(error);
  }
};


export {
  register,
  login,
};