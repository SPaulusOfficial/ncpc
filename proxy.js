const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(express.static('client/build'));

app.use('/api', createProxyMiddleware({
  changeOrigin: true,
  headers: {
    host: 'horizontal-ncpc-dev.herokuapp.com',
    origin: 'horizontal-ncpc-dev.herokuapp.com'
  },
  target: 'http://horizontal-ncpc-dev.herokuapp.com', 
}));

app.listen(process.env.PORT || 5000, () => console.log('Express server is running on localhost:5000'));