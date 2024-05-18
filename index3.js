// using GridFS
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const express = require('express');
const app = express();

const mongoURI = 'mongodb://0.0.0.0/image-test';
let gfs, gridfsBucket;

const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

conn.once('open', () => {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
   bucketName: 'uploads-3'
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads-3');
});

const storage = new GridFsStorage({
  url: mongoURI,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    return {
      filename: file.originalname,
      bucketName: 'uploads-3', // The collection name
    };
  },
});

const upload = multer({ storage });

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ file: req.file });
});

app.get('/image/:filename', async (req, res) => {
  const file = await gfs.files.findOne({ filename: req.params.filename });

  if (!file || file.length === 0) {
    return res.status(404).json({ err: 'No file exists' });
  }

  if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
    const readstream = gridfsBucket.openDownloadStream(file._id);
    readstream.pipe(res);
  } else {
    res.status(404).json({ err: 'Not an image' });
  }
});

const PORT = process.env.PORT || 5300;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
