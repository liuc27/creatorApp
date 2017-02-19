var db = require('../db')
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird');

var mongoosePaginate = require('mongoose-paginate');

var userSchema = new mongoose.Schema({
    userType: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    nickname: {
        type: String,
        required: false
    },
    sex: {
        type: String,
        required: false
    },
    headImgURL: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    province: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    launguage: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    introduction: {
        type: String,
        required: false
    },
    contact: {
        type: String,
        required: false
    },
    likedServiceProvider: [String],
    likedProduct: [String],
    purchasedProduct: [String],
    certificate: {
        type: String,
        required: false
    },
    product: [String],
    preProduct: [String],
    comment: []
})
userSchema.plugin(mongoosePaginate);

var user = db.model('user', userSchema)

module.exports = user
