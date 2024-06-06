// server.js
const express = require('express');
const { spawn } = require('child_process');
const app = express();

app.get('/download', (req, res) => {
  const child = spawn('node', ['spawn-process.js']);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Content-Disposition', 'attachment; filename=db_data.json');

  child.stdout.on('data', (data) => {
    res.write(data);
  });

  child.stdout.on('end', () => {
    res.end();
  });

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.log(code, '========')
      res.status(500).send(`Child process exited with code ${code}`);
    }
  });
});

const PORT = 5500;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
