const express = require('express');
const router = express.Router();
const SharedMemory = require('../models/SharedMemory'); // Adjust path as needed
const authenticateToken = require('../middleware/authenticateToken'); // If you have authentication middleware

// Post a New Memory
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { userId, tripId, title, description, imageUrl } = req.body; // Replace with actual fields
        const newMemory = await SharedMemory.create({
            userId,
            tripId,
            title,
            description,
            imageUrl
        });
        res.status(201).json(newMemory);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get all shared memories for a trip
router.get('/trip/:tripId', async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const memories = await SharedMemory.findAll({ where: { tripId } });
        res.json(memories);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Update a shared memory
router.put('/:memoryId', authenticateToken, async (req, res) => {
    try {
        const memoryId = req.params.memoryId;
        const updatedData = req.body;

        const memory = await SharedMemory.findByPk(memoryId);
        if (!memory) {
            return res.status(404).send('Memory not found');
        }

        await memory.update(updatedData);
        res.send('Memory updated');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Delete a shared memory
router.delete('/:memoryId', authenticateToken, async (req, res) => {
    try {
        const memoryId = req.params.memoryId;
        const memory = await SharedMemory.findByPk(memoryId);

        if (!memory) {
            return res.status(404).send('Memory not found');
        }

        await memory.destroy();
        res.send('Memory deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
