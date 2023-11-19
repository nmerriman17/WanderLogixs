const express = require('express');
const router = express.Router();
const Trip = require('../models/trip'); 
const authenticateToken = require('../middleware/authenticateToken'); // Ensure this middleware is correctly implemented

// Create a new trip
router.post('/', authenticateToken, async (req, res) => {
    try {
        // Extracting trip details from request body
        const { userId, destination, startDate, endDate, comment } = req.body;

        // Create a new trip in the database
        const newTrip = await Trip.create({
            userId, destination, startDate, endDate, comment
        });

        res.status(201).json(newTrip);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get all trips for a user
router.get('/', authenticateToken, async (req, res) => {
    try {
        // Assuming the userId is retrieved from the authentication middleware
        const userId = req.user.id; // Adjust this according to your middleware's implementation

        // Fetch all trips for the user from the database
        const trips = await Trip.findAll({ where: { userId } });

        res.json(trips);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
