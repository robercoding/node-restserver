const jwt = require('jsonwebtoken');

// ====================
// Verify Token
// ====================

let verifyToken = (req, res, next) => {

    let token = req.get('token');

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Not valid token'
                }
            });
        }

        req.user = decoded.user;

        if (decoded.user) {
            req.user = decoded.user;
        } else {
            req.user = decoded.userDB;
        }
        next();
    });
}


let verifyTokenAdminRole = (req, res, next) => {

    let user = req.user;

    if (user.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'User is not an admin'
            }
        });
    }

}

let verifyTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Not valid token'
                }
            });
        }

        if (decoded.user) {
            req.user = decoded.user;
        } else {
            req.user = decoded.userDB;
        }

        next();
    });
}

module.exports = {
    verifyToken,
    verifyTokenAdminRole,
    verifyTokenImg
}