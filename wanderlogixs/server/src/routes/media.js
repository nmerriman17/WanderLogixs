const express = require('express');
const router = express.Router();
const Media = require('../models/media'); // Adjust path as needed
const multer = require('multer'); // For handling file uploads

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' }); // Adjust storage as needed

// Add new media (file upload)
router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { tripId } = req.body; // Assuming tripId is sent along with the file
        const file = req.file;

        // Save file information in the database
        const newMedia = await Media.create({
            tripId,
            filePath: file.path,
            originalName: file.originalname,
            // Add other media attributes as needed
        });

        res.status(201).json(newMedia);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Get all media for a trip
router.get('/trip/:tripId', async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const mediaItems = await Media.findAll({ where: { tripId } });
        res.json(mediaItems);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// Delete a media item
router.delete('/:mediaId', async (req, res) => {
    try {
        const mediaId = req.params.mediaId;
        const mediaItem = await Media.findByPk(mediaId);

        if (!mediaItem) {
            return res.status(404).send('Media item not found');
        }

        // If storing files, delete the file from storage here

        await mediaItem.destroy();
        res.send('Media item deleted');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
