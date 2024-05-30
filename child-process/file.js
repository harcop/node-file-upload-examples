// app.js
const express = require('express');
const { fork } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3033;

app.get('/', (req, res) => {
  const filePath = path.join(__dirname, '../movie.mp4');
  console.log(filePath)
  res.send(filePath)
})

app.get('/download', (req, res) => {
  const filePath = path.join(__dirname, '../movie.mp4');
  console.log(filePath)

  const child = fork('./file-streamer.js');

  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`
  });

  child.on('message', (data) => {
    if (data === null) {
      res.end(); // End the response when the child process signals end of stream
    } else if (data.error) {
      res.status(500).send(`Error: ${data.error}`);
    } else {
      res.write(Buffer.from(data)); // Stream data chunks to the client
    }
  });

  child.send(filePath); // Send the file path to the child process
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
