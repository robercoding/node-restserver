const express = require('express');

const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express();

const User = require('../models/user');
const { verifyToken, verifyTokenAdminRole } = require('../middlewares/authentication');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

const jwt = require('jsonwebtoken');

app.get('/', function(req, res) {
    res.json('Hello World')
})

app.get('/users/:id', (req, res) => {
    let id = req.params.id;

    User.findById(id, (err, userDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json(userDB)
    })
});

app.get('/users', verifyToken, (req, res) => {

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

            User.countDocuments({}, (err, count) => {
                res.json({
                    ok: true,
                    users: usersDB,
                    count
                });
            })
        })
});

app.post('/users', [verifyToken, verifyTokenAdminRole], (req, res) => {

    let body = req.body;

    let user = new User({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role,
    })

    user.save((err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        let token = jwt.sign({
            user: user
        }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRE });

        res.json({
            ok: true,
            user: user,
            token
        });
    })
});


app.put('/users/:id', [verifyToken, verifyTokenAdminRole], (req, res) => {
    let id = req.params.id;

    let body = _.pick(req.body, ['name', 'email', 'img', 'role', 'state']);

    User.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, userDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            user: userDB
        });
    })
});

app.delete('/users/:id', [verifyToken, verifyTokenAdminRole], (req, res) => {

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
});


//GOOGLE CONFIGURATION
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];

    /*     console.log(payload.name);
        console.log(payload.email);
        console.log(payload.picture); */
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;


    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            });
        });

    User.findOne({ email: googleUser.email }, (err, userDB) => {
        if (err) {
            res.status(500).json({
                ok: false,
                err
            });
        }

        if (userDB) {
            if (!userDB.google) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'You must use normal authentication'
                    }
                });
            } else {
                let token = jwt.sign({ user: userDB }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRE });

                return res.json({
                    ok: true,
                    user: userDB,
                    token
                })
            }
        } else {

            let user = new User();

            user.name = googleUser.name;
            user.email = googleUser.email;
            user.img = googleUser.img;
            user.google = true;
            user.password = ':)';

            user.save((err, userDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({ user: userDB }, process.env.SEED, { expiresIn: process.env.TOKEN_EXPIRE });

                return res.json({
                    ok: true,
                    user: userDB,
                    token
                })
            });
        }

    });
});


module.exports = app;