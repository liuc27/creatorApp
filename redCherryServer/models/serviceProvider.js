var db = require('../db')
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird');

var mongoosePaginate = require('mongoose-paginate');

var serviceProviderSchema = new mongoose.Schema({

    serviceProviderName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    serviceProviderImageURL: {
        type: String,
        required: true
    },
    serviceProviderTitle: {
        type: String,
        required: false
    },
    serviceProviderIntroduction: {
        type: String,
        required: true
    },
    serviceProviderLevel: {
        type: String,
        required: false
    },
    likedBy: [String],
    comment: [],
    product: [],
    preProduct: []
})

serviceProviderSchema.plugin(mongoosePaginate);

var serviceProvider = db.model('serviceProvider', serviceProviderSchema)

module.exports = serviceProvider
