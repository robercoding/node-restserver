const express = require('express');

let { verifyToken, verifyTokenAdminRole } = require('../middlewares/authentication');

let app = express();

let Category = require('../models/category');

let jwt = require('jsonwebtoken');


//Retrieve all categories
app.get('/category', (req, res) => {

    Category.find({})
        .sort('description')
        .populate('user', 'name email')
        .exec((err, categories) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                categories: categories
            })

        })
});

//Retrieve a category with a specify id
app.get('/category/:id', (req, res) => {

    let id = req.params.id;

    Category.findById(id, (err, category) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            category
        });
    })

});

//Create a new cateogory
app.post('/category', verifyToken, (req, res) => {

    let body = req.body;

    let category = new Category({
        description: body.description,
        user: req.user._id
    });

    category.save((err, category) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.status(201).json({
            category: category,
            token
        });
    });
});

app.put('/category/:id', [verifyToken, verifyTokenAdminRole], (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Category.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, updatedCategory) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!updatedCategory) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            category: updatedCategory
        })
    })
});

//Delete a category by admin
app.delete('/category/:id', [verifyToken, verifyTokenAdminRole], (req, res) => {

    let id = req.params.id;

    Category.findByIdAndDelete(id, (err, deletedCategory) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            category: deletedCategory
        })
    })

});


module.exports = app;