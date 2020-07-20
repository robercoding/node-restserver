const express = require('express');
const app = express();
const fileUpload = require('express-fileupload');

const User = require('../models/user');
const Product = require('../models/product');

const fs = require('fs');
const path = require('path');


app.use(fileUpload({
    useTempFiles: true
}));

app.put('/upload/:type/:id', (req, res) => {

    let type = req.params.type;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'We couldnt find any file'
            }
        });
    }

    // Check Types
    let validTypes = ['products', 'users'];

    if (validTypes.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Valid extensions are ' + validTypes.join(', ')
            }
        })
    }

    //Check Extensions
    let file = req.files.file;
    let validExtensions = ['jpg', 'gif', 'png', 'jpeg'];

    let nameSplit = file.name.split('.');
    let extension = nameSplit[nameSplit.length - 1];


    if (validExtensions.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Valid extensions are ' + validExtensions.join(', ')
            }
        });
    }

    //Remove blank spaces
    let fileName = `${ id }-${new Date().getMilliseconds()}.${extension}`.replace(/\s/g, "");

    createFolders(type);

    file.mv(`uploads/${ type }/${ fileName }`, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //If there are more types, use switch statement.
        if (type === 'users') {
            userImage(id, res, fileName);
        } else {
            productImage(id, res, fileName)
        }

    });
});

function userImage(id, res, fileName) {

    User.findById(id, (err, userDB) => {
        if (err) {
            removeFile(fileName, 'users');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!userDB) {
            removeFile(fileName, 'users');
            return res.status(400).json({
                ok: false,
                err: {
                    message: `We couldn't find the user, please try again later.`
                }
            });
        }

        removeFile(userDB.img, 'users')

        userDB.img = fileName;

        userDB.save((err, savedUser) => {
            res.json({
                ok: true,
                user: savedUser,
                img: fileName
            })
        });
    });
}

function productImage(id, res, fileName) {

    Product.findById(id, (err, productDB) => {
        if (err) {
            removeFile(fileName, 'products');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productDB) {
            removeFile(fileName, 'products');
            return res.status(400).json({
                ok: false,
                err: {
                    message: `We couldn't find the product, please try again later.`
                }
            });
        }

        removeFile(productDB.img, 'products');

        productDB.img = fileName;

        productDB.save((err, savedProduct) => {
            res.json({
                ok: true,
                savedProduct,
                fileName
            });
        });
    });
}

function removeFile(fileName, type) {
    let pathImg = path.resolve(__dirname, `../../uploads/${type}/${fileName}`);

    if (fs.existsSync(pathImg)) {
        fs.unlinkSync(pathImg);
    }
}

function createFolders(type) {
    try {
        fs.mkdirSync(path.resolve(__dirname, `../../uploads`));
    } catch (err) {
        if (err.code !== 'EEXIST') {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
    }
    try {
        fs.mkdirSync(path.resolve(__dirname, `../../uploads/${type}`));
    } catch (err) {
        if (err.code !== 'EEXIST') {
            return res.status(500).json({
                ok: false,
                error: err
            });
        }
    }
}

module.exports = app;