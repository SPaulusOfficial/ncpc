const routes = require('express').Router();

routes.get('*', function(req, res) {  res.render('error');});

routes.get('/', function(req, res, next) {
    var status = "Invalid";

    res.render('index', {
        status: status
    });
});

module.exports = routes;