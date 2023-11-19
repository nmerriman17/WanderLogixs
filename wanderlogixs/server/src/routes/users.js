const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const { User } = require('../models'); // Ensure this path matches your project structure
const router = express.Router();

// Register a new user
router.post('/register', [
    check('username').not().isEmpty(),
    check('email').isEmail(),
    check('password').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        res.status(201).json({ message: 'User registered', userId: newUser.id });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// User login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).send('Invalid credentials');
        }

        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send('Invalid credentials');
        }

        // Generate JWT token
        const accessToken = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Middleware to authenticate token
function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        // Retrieve user data from database using req.user.userId
        const user = await User.findByPk(req.user.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        res.status(200).json({ 
            username: user.username, 
            email: user.email 
            // Add other user details you want to send
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
