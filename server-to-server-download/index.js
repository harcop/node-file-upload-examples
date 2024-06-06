// this server connect the client to new spin up another server to download from it. Like a load balancer

const express = require('express');
const { fork } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Helper function to spawn a new server
function spawnNewServer() {
  return new Promise((resolve, reject) => {
    const serverProcess = fork('./newServer.js');
    serverProcess.on('message', (message) => {
      if (message === 'ready') {
        resolve(serverProcess);
      }
    });
    serverProcess.on('error', reject);
  });
}

const app = express();

app.get('/download', async (req, res, next) => {
  console.log('Received request on /download, spinning up new server...');

  try {
    await spawnNewServer();
    const newServerUrl = 'http://localhost:4001';

    // Proxy middleware to forward request to new server
    const proxy = createProxyMiddleware({
      target: newServerUrl,
      changeOrigin: true,
      onProxyReq: (proxyReq, req, res) => {
        // Remove the initial server after the proxy request is made
        proxyReq.on('finish', () => {
          server.close(() => {
            console.log('Initial server shut down');
          });
        });
      },
      onError: (err, req, res) => {
        console.error('Error forwarding request:', err);
        res.status(500).send('Internal Server Error');
      }
    });

    proxy(req, res, next);
  } catch (error) {
    console.error('Error spawning new server:', error);
    res.status(500).send('Internal Server Error');
  }
});

const server = app.listen(4000, () => {
  console.log('Initial server listening on port 4000');
});
