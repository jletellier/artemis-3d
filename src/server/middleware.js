const express = require('express');

module.exports = function(app, server) {

    app.get('/api/p/:id', function(req, res, next) {
        console.log('test');
        next();
    });

};
