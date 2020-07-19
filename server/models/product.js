let mongoose = require('mongoose');
const { unique } = require('underscore');
const uniqueValidator = require('mongoose-unique-validator');
let Schema = mongoose.Schema;


let productSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is needed'],
        unique: true
    },
    priceUnit: {
        type: Number,
        required: [true, 'The price unitary is needed']
    },
    description: {
        type: String,
        required: false
    },
    available: {
        type: Boolean,
        required: true,
        default: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

productSchema.plugin(uniqueValidator, '{PATH} must be unique')

module.exports = mongoose.model('Product', productSchema);