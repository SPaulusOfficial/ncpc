const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

app.use(express.static('client/build'));

app.use('/api', proxy('horizontal-ncpc-dev.herokuapp.com'));

app.listen(process.env.PORT || 5000, () => console.log('Express server is running on localhost:5000'));