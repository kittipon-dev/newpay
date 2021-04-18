const mongoose = require('mongoose')
const Schema = mongoose.Schema
const code_deviceSchema = new Schema({
    date: String,
    ver: String,
    description: String,
    url: String,
    status: String
})
const Code_device = mongoose.model('code_device', code_deviceSchema)
module.exports = Code_device