const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const User = require('../models/user');
const Product = require('../models/product');

const { verifyToken, verifyTokenImg } = require('../middlewares/authentication');

app.get('/images/:type/:img', verifyTokenImg, (req, res) => {

    let type = req.params.type;
    let img = req.params.img;

    //path.resolve('./ass')
    //res.sendfile('/assets/no-image.jpg');

    let types = ['users', 'products'];

    let imagePath = path.resolve(__dirname, `../../uploads/${type}/${img}`);

    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath)
    } else {
        let noImage = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImage);
    }




    //res.sendFile(path.join(__dirname, '../assets/no-image.jpg'));
});

module.exports = app;