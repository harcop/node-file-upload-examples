// download video

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4430;

// Define route to handle download requests
app.get('/download', (req, res) => {
  const filePath = './movie.mp4';

  // Check if the file exists
  fs.stat(filePath, (err, stats) => {
    if (err) {
      console.error(err);
      return res.status(404).send('File not found');
    }

    // Set headers for the response
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename=' + path.basename(filePath));

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  });
});

app.get('/play', (req, res) => {
  res.send('---playing---')
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
