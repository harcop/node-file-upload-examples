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

  const child = fork('./file-fork.js');

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

app.get('/download-db', (req, res) => {
  const child = spawn('node', [path.join(__dirname, 'db-download-spawn.js')]);

  res.writeHead(200, {
    'Content-Type': 'text/csv',
    'Content-Disposition': 'attachment; filename="users.csv"'
  });

  child.stdout.pipe(res); // Pipe the child process's stdout to the response

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      res.status(500).send(`Child process exited with code ${code}`);
    } else {
      res.end();
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
