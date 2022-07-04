const mongoose = require('mongoose')
const Uploads = mongoose.Schema({
  url: String,
  id: String
})

module.exports = mongoose.model('uploads', Uploads)