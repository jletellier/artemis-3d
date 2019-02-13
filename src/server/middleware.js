const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = function(app, server, uploadFolder) {

    app.use(fileUpload());

    app.post('/api/p/:id/upload', function(req, res) {
        if (Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        
        const file = req.files.content;
        const projectFolder = path.resolve(uploadFolder, `${req.params.id}/`);

        mkdirp(projectFolder, function(err) {
            if (err) {
                return console.error(err);
            }

            file.mv(path.resolve(projectFolder, file.name), function(err) {
                if (err) {
                    return res.status(500).send(err);
                }
    
                res.send('File uploaded!');
            });
        });
    });

};
