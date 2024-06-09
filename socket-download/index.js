const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<h1>Socket.io File Transfer</h1>');
});

const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('requestFile', (fileName) => {
        const filePath = path.join(__dirname, fileName);
        const readStream = fs.createReadStream(filePath);

        readStream.on('data', (chunk) => {
            socket.emit('fileData', chunk);
        });

        readStream.on('end', () => {
            socket.emit('fileEnd');
        });

        readStream.on('error', (err) => {
            socket.emit('fileError', err.message);
        });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = 4450
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
