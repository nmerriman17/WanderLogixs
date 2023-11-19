require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');  // Ensure this path matches your project structure
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const router = express.Router();

// Nodemailer setup for email sending
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // e.g., 'gmail'
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});

// User Registration Route
router.post('/register', [
    check('username', 'Username is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password } = req.body;

        // Check if the user already exists
        let user = await User.findOne({ where: { email } });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Create the user
        user = await User.create({
            username,
            email,
            password: hashedPassword,
            emailVerificationToken: verificationToken,
            isEmailVerified: false
        });

        // Send verification email
        const verificationUrl = `http://${req.headers.host}/api/auth/verify-email/${verificationToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: 'Email Verification',
            text: `Please click on the following link to verify your email:\n\n${verificationUrl}`
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email: ', err);
                return res.status(500).send('Error in sending verification email');
            }
            res.status(201).json({ msg: 'User registered, verification email sent' });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Email Verification Route
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User.findOne({
            where: {
                emailVerificationToken: token,
                isEmailVerified: false
            }
        });

        if (!user) {
            return res.status(400).send('This link is invalid or has already been used');
        }

        user.emailVerificationToken = null;
        user.isEmailVerified = true;
        await user.save();

        res.redirect('/email-verified-success'); // Redirect to a success page on your frontend
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during email verification');
    }
});

// Password Reset Request Route
router.post('/password-reset', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ msg: 'User with given email does not exist' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        const resetUrl = `http://${req.headers.host}/api/auth/password-reset/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: user.email,
            subject: 'Password Reset Link',
            text: `Please click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}`
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email: ', err);
                return res.status(500).send('Error in sending password reset email');
            }
            res.status(200).json('Recovery email sent');
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Password Reset Verification and Update Route
router.post('/password-reset/:token', [
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
        }

        // Set the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        res.status(200).json({ msg: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// User Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
