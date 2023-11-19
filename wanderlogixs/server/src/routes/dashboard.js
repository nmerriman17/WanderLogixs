const express = require('express');
const router = express.Router();
const Trip = require('server/src/models/trip.js'); // Adjust path as needed
const Media = require('server/src/models/media.js'); // Adjust path as needed
const Expense = require('server/src/models/expense.js'); // Adjust path as needed
const SharedMemories = require('server/src/models/expense.js'); // Adjust path as needed
const { Op } = require("sequelize");

router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const limit = 4; // The limit for 'recent' items

        // Fetch recent trips
        const recentTrips = await Trip.findAll({
            where: { userId },
            order: [['startDate', 'DESC']],
            limit: limit
        });

        // Fetch recent media
        const recentMedia = await Media.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: limit
        });

        // Fetch recent expenses
        const recentExpenses = await Expense.findAll({
            where: { userId },
            order: [['date', 'DESC']],
            limit: limit
        });

        // Fetch shared memories
        const sharedMemories = await SharedMemory.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit: limit
        });

        // Construct dashboard data
        const dashboardData = {
            recentTrips,
            recentMedia,
            recentExpenses,
            sharedMemories
        };

        res.json(dashboardData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});



module.exports = router;
