// using blob db storage
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

mongoose.connect('mongodb://0.0.0.0/image-test', { useNewUrlParser: true, useUnifiedTopology: true });

const app = express();
const upload = multer({ dest: 'uploads/' });

const imageSchema = new mongoose.Schema({
  name: String,
  img: {
    data: Buffer,
    contentType: String
  }
});

const Image = mongoose.model('Image', imageSchema);

app.post('/upload', upload.single('image'), (req, res) => {
  const newImage = new Image({
    name: req.body.name,
    img: {
      data: fs.readFileSync(req.file.path),
      contentType: req.file.mimetype
    }
  });
  newImage.save()
    .then((response) => res.send(`Image uploaded successfully: ${response._id}`, ))
    .catch(err => res.status(500).send('Failed to upload image'));
});

app.get('/image/:id', async (req, res) => {
  const image = await Image.findById(req.params.id)
  if (!image) return res.status(500).send('Error retrieving image');
  res.contentType(image.img.contentType);
  res.send(image.img.data);
});

app.listen(5200, () => {
  console.log('Server started on http://localhost:5200');
});
