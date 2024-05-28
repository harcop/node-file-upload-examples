// download database content
const express = require('express');
const mongoose = require('mongoose');
const { Transform } = require('stream');

const app = express();
const port = 4450;

// Connect to MongoDB
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true, useUnifiedTopology: true });

// Define a Mongoose schema and model
const testFileSchema = new mongoose.Schema({}, {strict: false, strictPopulate: false});

const testFileModel = mongoose.model('testFile', testFileSchema);

app.get('/download', (req, res) => {
  // Set headers for the response
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename=data.json');

  // Create a cursor to stream documents
  const cursor = testFileModel.find().cursor();

  // Transform stream to format data
  const transformStream = new Transform({
    writableObjectMode: true,
    transform(doc, encoding, callback) {
      this.push(JSON.stringify(doc) + '\n');
      callback();
    }
  });

  // Pipe the cursor to the transform stream and then to the response
  cursor.pipe(transformStream).pipe(res);
});

app.get('/play', (req, res) => {
  res.send('---playing---')
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
