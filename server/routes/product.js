const express = require('express');

const { verifyToken, verifyTokenAdminRole } = require('../middlewares/authentication');

const app = express();

let Product = require('../models/product');

app.get('/product', (req, res) => {

    Product.find()
        .populate(['user', 'category'])
        .sort('name')
        .exec((err, products) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                products
            })
        });
});

app.get('/product/:id', (req, res) => {

    let id = req.params.id;

    Product.findById(id)
        .populate('user', 'category')
        .exec((err, product) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!product) {
                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err: {
                            message: `We couldn't find the product`
                        }
                    });
                }
            }

            res.json({
                product
            });
        });
});

app.get('/product/search/:name', (req, res) => {
    let name = req.params.name;

    let regex = new RegExp(name, 'i');

    Product.find({ 'name': regex })
        .populate(['category', 'user'])
        .exec((err, product) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                product
            });
        });
});


app.post('/product', verifyToken, (req, res) => {

    let body = req.body;
    let product = new Product({
        user: req.user._id,
        name: body.name,
        priceUnit: body.priceUnit,
        description: body.description,
        available: body.available,
        category: body.category
    });

    product.save((err, productDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            product: productDB
        });
    });
});

app.put('/product/:id', verifyToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Product.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updatedProduct) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            updatedProduct
        });
    })
});

app.delete('/product/:id', [verifyToken, verifyTokenAdminRole], (req, res) => {

    let id = req.params.id;

    Product.findByIdAndUpdate(id, { available: false }, { new: true, context: 'query' }, (err, unavailableProduct) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            product: unavailableProduct
        });
    });
});

module.exports = app;