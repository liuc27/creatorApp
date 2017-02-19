var mongoose = require('mongoose')
mongoose.Promise = require('bluebird');

mongoose.connect('mongodb://localhost/social', function() {
    console.log('mongodb connected')
})
module.exports = mongoose
