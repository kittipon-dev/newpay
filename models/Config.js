const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ConfigSchema = new Schema({
    user_id: Number,
})
const Config = mongoose.model('Config', ConfigSchema)
module.exports = Config