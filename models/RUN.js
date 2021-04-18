const mongoose = require('mongoose')
const Schema = mongoose.Schema
const rSchema = new Schema({
    user_id: String,
    dname: String,
    nonce_str: String,
    d: Number,
    m: Number,
    y: Number,
    t: String,
    run: Boolean
})
const Run = mongoose.model('run', rSchema)
module.exports = Run