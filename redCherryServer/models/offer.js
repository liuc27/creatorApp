var db = require('../db')
var mongoose = require('mongoose')
mongoose.Promise = require('bluebird');

var mongoosePaginate = require('mongoose-paginate');

var offerSchema = new mongoose.Schema({
    creatorName: {
        type: String,
        required: true
    },
    serviceProviderName: [String],
    username: [String],
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    serviceType: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: false
    },
    allDay: {
        type: Boolean,
        required: false
    },
    serviceProviderNumberLimit: {
        type: Number,
        required: false
    },
    userNumberLimit: {
        type: Number,
        required: false
    },
    pricePerHour: {
        type: Number,
        required: false
    }
})

offerSchema.plugin(mongoosePaginate);

var offer = db.model('offer', offerSchema)

module.exports = offer
