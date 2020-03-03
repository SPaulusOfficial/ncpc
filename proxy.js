const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(express.static('client/build'));

if (process.env.NODE_ENV === 'local') {
  app.get('/api/interests', (req, res) => {
    res.sendFile(path.join(__dirname, '/sampleData', 'interests.json'));
  });

  app.get('/api/package', (req, res) => {
    res.sendFile(path.join(__dirname, '/sampleData', 'package.json'));
  });

  app.get('/api/profiles', (req, res) => {
    res.sendFile(path.join(__dirname, '/sampleData', 'profiles.json'));
  });

  app.get('/api/subscriptions', (req, res) => {
    res.sendFile(path.join(__dirname, '/sampleData', 'subscriptions.json'));
  });
}
app.use('/api', createProxyMiddleware({
  changeOrigin: true,
  headers: {
    host: 'horizontal-ncpc-dev.herokuapp.com',
    origin: 'horizontal-ncpc-dev.herokuapp.com'
  },
  target: 'http://horizontal-ncpc-dev.herokuapp.com', 
}));

app.listen(process.env.PORT || 5000, () => console.log('Express server is running on localhost:5000'));