const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;


let validatedRoles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} isnt a valid role'
}

let userSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is needed']
    },
    email: {
        type: String,
        unique: [true, 'Email must be unique'],
        required: [true, 'Email is needed'],
    },
    password: {
        type: String,
        required: [true, 'Password is needed']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: validatedRoles
    },
    state: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
});

userSchema.methods.toJSON = function() {
    let user = this

    let userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

userSchema.plugin(uniqueValidator, { message: '{PATH} must be unique' });

module.exports = mongoose.model('User', userSchema);