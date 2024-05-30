// fileStreamer.js
const fs = require('fs');

process.on('message', (filePath) => {
  const readStream = fs.createReadStream(filePath);

  readStream.on('data', (chunk) => {
    // console.log(chunk, '----chunk')
    process.send(chunk);
  });

  readStream.on('end', () => {
    process.send(null); // Signal the end of the stream
    process.exit(0);
  });

  readStream.on('error', (err) => {
    process.send({ error: err.message });
    process.exit(1);
  });
});
