var db = require('../db')

var mongoose = require('mongoose')
mongoose.Promise = require('bluebird');

var mongoosePaginate = require('mongoose-paginate');

var productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: false
    },
    productName: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false
    },
    characters: [],
    location: [],
    productLevel: {
        type: String,
        required: false
    },
    serviceRecords: [],
    serviceProviderName: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: false
    },
    guideAvailableTime: [],
    chatAvailableTime: [],
    pricing: {
        CN: {
            guide: {
                type: String,
                required: false
            },
            chat: {
                type: String,
                required: false
            }
        },
    },
    retail: {
        type: Number,
        required: false
    },
    list: {
        type: Number,
        required: false
    },
    score: {
        type: String,
        required: false
    },
    introduction: {
        type: String,
        required: false
    },
    link: {
        type: String,
        required: false
    },
    occupation: [],
    follower: [],
    imageURL: {
        type: String,
        required: true
    },
    serviceProviderId: {
        type: String,
        required: true
    },
    serviceProviderImageURL: {
        type: String,
        required: true
    },
    certificateURL: {
        type: String,
        required: true
    },
    videoURL: {
        type: String,
        required: true
    },
    comment: [],
    likedBy: [String],
    purchasedBy: [String]

});

productSchema.plugin(mongoosePaginate);

var Product = db.model('Product', productSchema)

module.exports = Product
