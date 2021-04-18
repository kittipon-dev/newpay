const mongoose = require('mongoose')
const Schema = mongoose.Schema
const allSchema = new Schema({
    user_id: Number,
    time: String,
    amount: Number,
    d: Number,
    m: Number,
    y: Number
})
const Graph_all = mongoose.model('Graph_all', allSchema)
module.exports = Graph_all