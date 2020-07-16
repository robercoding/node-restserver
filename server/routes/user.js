const express = require('express')

const bcrypt = require('bcrypt');
const _ = require('underscore')

const app = express();

const User = require('../models/user');

app.get('/', function(req, res) {
    res.json('Hello World')
})

app.get('/users/:id', function(req, res) {
    let id = req.params.id;

    User.findById(id, (err, userDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        res.json(userDB)
    });
})

app.get('/users', function(req, res) {

    let from = req.query.from || 0;

    from = Number(from)

    let limit = req.query.limit || 5
    limit = Number(limit)

    User.find({ state: true })
        .skip(from)
        .limit(limit)
        .exec((err, usersDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            User.countDocuments({ state: true }, (err, count) => {
                res.json({
                    ok: true,
                    users: usersDB,
                    count
                })
            })
        })
});

app.post('/users', function(req, res) {

    let body = req.body;

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
    })

    user.save((err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            user: userDB
        })
    });
});


app.put('/users/:id', function(req, res) {
    let id = req.params.id;

    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'state']);

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        };

        res.json({
            ok: true,
            user: userDB
        });
    })
})

app.delete('/users/:id', function(req, res) {

    let id = req.params.id;

    /*User.findByIdAndRemove(id, (err, deletedUser) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }


        if (!deletedUser) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: 'Couldnt find the user'
                }
            });
        }

        res.json({
            ok: true,
            user: deletedUser
        });
    })*/

    let changeState = {
        state: false
    }

    User.findByIdAndUpdate(id, changeState, { new: true }, (err, modifiedUserState) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok: true,
            user: modifiedUserState
        })
    })

})



module.exports = {
    app
}