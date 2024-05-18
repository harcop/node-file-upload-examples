// using file storage
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const Image = require('./models/Image');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0/image-test', { useNewUrlParser: true, useUnifiedTopology: true });

// Set up storage engine for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Endpoint to upload an image
app.post('/upload', upload.single('image'), async (req, res) => {
  console.log('-------file uploading')
    const file = req.file;
    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const imageUrl = `http://localhost:5100/uploads/${file.filename}`;
    const newImage = new Image({
        filename: file.filename,
        url: imageUrl,
    });

    await newImage.save();
    res.status(201).send(newImage);
});

// Endpoint to serve uploaded images
app.use('/uploads', express.static('uploads'));

// Endpoint to get image details
app.get('/images/:id', async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).send('Image not found.');
        }
        res.send(image);
    } catch (error) {
        res.status(500).send('Server error.');
    }
});

// Start the server
const PORT = process.env.PORT || 5100;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
