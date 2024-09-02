const mongoose = require('mongoose')
const planelixfiles = mongoose.Schema({
    _id: String,
    type: String,
    url: String,
    mpd_url: String
})

module.exports = mongoose.model('planelixFiles', planelixfiles)